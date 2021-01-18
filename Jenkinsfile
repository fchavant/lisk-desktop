@Library('lisk-jenkins') _

def waitForHttp() {
	timeout(1) {
		waitUntil {
			script {
				dir('./docker') {
					def api_available = sh script: "make -f Makefile.jenkins ready", returnStatus: true
					return (api_available == 0)
				}
			}
		}
	}
}

properties([disableConcurrentBuilds(), pipelineTriggers([])])
pipeline {
	agent { node { label 'lisk-desktop' } }
	options {
		buildDiscarder(logRotator(numToKeepStr: '168', artifactNumToKeepStr: '5'))
	}
	parameters {
		booleanParam(name: 'SKIP_PERCY', defaultValue: false, description: 'Skip running percy.')
                string(name: 'LISK_CORE_VERSION', defaultValue: 'release/3.0.0-beta.1', description: 'Use lisk-core branch.', )
                string(name: 'LISK_CORE_IMAGE_VERSION', defaultValue: '3.0.0-beta.1-a7842d112d5136d9462501763c4cb2895096e900', description: 'Use lisk-core docker image.', )
		string(name: 'LISK_SERVICE_VERSION', defaultValue: 'development', description: 'Use lisk-service branch.', )
	}
	stages {
		stage('Install npm dependencies') {
			steps {
				nvm(getNodejsVersion()) {
					sh 'npm install --registry https://npm.lisk.io --no-optional'
				}
			}
		}
		stage('Build') {
			steps {
				parallel (
					"ESLint": {
						ansiColor('xterm') {
							nvm(getNodejsVersion()) {
								sh 'npm run --silent eslint'
							}
						}
					},
					"build": {
						withCredentials([string(credentialsId: 'github-lisk-token', variable: 'GH_TOKEN')]) {
							nvm(getNodejsVersion()) {
								sh '''
								cp -R /home/lisk/fonts/basier-circle src/assets/fonts
								cp -R /home/lisk/fonts/gilroy src/assets/fonts
								npm run --silent build
								npm run --silent build:testnet

								npm run install-electron-dependencies
								USE_SYSTEM_XORRISO=true npm run dist:linux
								'''
							}
						}
						archiveArtifacts allowEmptyArchive: true, artifacts: 'dist/lisk-linux-*'
						archiveArtifacts allowEmptyArchive: true, artifacts: 'dist/latest-linux.yml'
						stash includes: 'app/build/', name: 'build'
					}
				)
			}
		}
		stage('Deploy build') {
			agent { node { label 'master-01' } }
			steps {
				echo 'pass'
			}
		}
		stage('Run tests') {
			environment {
				LISK_CORE_IMAGE_VERSION = "${params.LISK_CORE_IMAGE_VERSION}"
			}
			steps {
				parallel (
					"jest": {
						ansiColor('xterm') {
							nvm(getNodejsVersion()) {
								sh 'ON_JENKINS=true npm run --silent test'
							}
						}
					},
					"cypress": {
						dir('lisk') {
							checkout([$class: 'GitSCM',
							          branches: [[name: "${params.LISK_CORE_VERSION}" ]],
								  userRemoteConfigs: [[url: 'https://github.com/LiskHQ/lisk-core']]])
						}
						withCredentials([string(credentialsId: 'lisk-hub-testnet-passphrase', variable: 'TESTNET_PASSPHRASE')]) {
						withCredentials([string(credentialsId: 'lisk-hub-cypress-record-key', variable: 'CYPRESS_RECORD_KEY')]) {
							ansiColor('xterm') {
								wrap([$class: 'Xvfb', parallelBuild: true, autoDisplayName: true]) {
									nvm(getNodejsVersion()) {
										sh '''#!/bin/bash -xe
										export N=${EXECUTOR_NUMBER:-0}; N=$((N+1))

										rm -rf $WORKSPACE/$BRANCH_NAME/
										cp -rf $WORKSPACE/lisk/docker/ $WORKSPACE/$BRANCH_NAME/
										cp $WORKSPACE/test/dev_blockchain.db.gz $WORKSPACE/$BRANCH_NAME/dev_blockchain.db.gz
										cd $WORKSPACE/$BRANCH_NAME
										cp .env.development .env
										sed -i -r -e "s/ENV_LISK_VERSION=.*$/ENV_LISK_VERSION=$LISK_CORE_IMAGE_VERSION/" .env

										sed -i -r -e '/ports:/,+2d' docker-compose.yml
										# random port assignment
										cat <<EOF >docker-compose.override.yml
version: "3"
services:

  lisk:
    ports:
      - \\${ENV_LISK_HTTP_PORT}
      - \\${ENV_LISK_WS_PORT}
EOF

										ENV_LISK_VERSION="$LISK_CORE_IMAGE_VERSION" make coldstart
										export CYPRESS_baseUrl=http://127.0.0.1:565$N/#/
										export CYPRESS_coreUrl=http://127.0.0.1:$( docker-compose port lisk 4000 |cut -d ":" -f 2 )
										cd -

										npm run serve -- $WORKSPACE/app/build -p 565$N -a 127.0.0.1 &>server.log &
										set +e
										set -o pipefail
										#npm run cypress:run |tee cypress.log
										echo "pass"
										ret=$?
										if [ $ret -ne 0 ]; then
										  FAILED_TESTS="$( awk '/Spec/{f=1}f' cypress.log |grep --only-matching '✖ .*.feature' |awk '{ print "test/cypress/features/"$2 }' |xargs| tr -s ' ' ',' )"
                                          cd $WORKSPACE/$BRANCH_NAME
                                          make coldstart
					  docker-compose port lisk 4000 |cut -d ":" -f 2 >$WORKSPACE/.core_port
                                          export CYPRESS_coreUrl=http://127.0.0.1:$( cat $WORKSPACE/.core_port )
                                          sleep 10
                                          cd -
                                          #npm run cypress:run -- --record --spec $FAILED_TESTS |tee cypress.log
					  echo "pass"
                                          ret=$?
										fi
										exit $ret
										'''
									}
								}
							}
						}
						}
						dir('lisk-service') {
							checkout([$class: 'GitSCM',
								  branches: [[name: "${params.LISK_SERVICE_VERSION}" ]],
								  userRemoteConfigs: [[url: 'https://github.com/LiskHQ/lisk-service']]])
							sh '''
							make build-core
							make build-gateway
							make build-template
							make build-tests
							'''
							dir('docker') {
								sh '''
								ENABLE_HTTP_API='http-version1,http-version1-compat,http-status,http-test' \
								ENABLE_WS_API='rpc,rpc-v1,blockchain,rpc-test' \
								LISK_CORE_HTTP=http://127.0.0.1:$( cat $WORKSPACE/.core_port ) \
								LISK_CORE_WS=ws://127.0.0.1:$( cat $WORKSPACE/.core_port ) \
								make -f Makefile.jenkins up
								'''
								waitForHttp()
							}
						}
					},
					"percy": {
						script {
							if(params.SKIP_PERCY){
								echo 'Skipping percy run as requested.'
							} else {
								ansiColor('xterm') {
									nvm(getNodejsVersion()) {
										withCredentials([string(credentialsId: 'PERCY_TOKEN', variable: 'PERCY_TOKEN')]) {
											sh 'npm run percy'
										}
									}
								}
							}
						}
					},
				)
			}
		}
	}
	post {
		cleanup {
			ansiColor('xterm') {
				sh '( cd $WORKSPACE/lisk-service/docker && make -f Makefile.jenkins logs || true ) || true'
				sh '( cd $WORKSPACE/lisk-service/docker && make -f Makefile.jenkins mrproper || tue ) || true'
				sh '( cd $WORKSPACE/$BRANCH_NAME && docker-compose logs && make mrproper || true ) || true'
			}
			cleanWs()
		}
	}
}
// vim: filetype=groovy
