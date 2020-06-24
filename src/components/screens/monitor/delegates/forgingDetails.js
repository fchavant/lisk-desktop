// istanbul ignore file
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import AccountVisual from '../../../toolbox/accountVisual';
import Tooltip from '../../../toolbox/tooltip/tooltip';
import routes from '../../../../constants/routes';
import Box from '../../../toolbox/box';
import BoxHeader from '../../../toolbox/box/header';
import BoxContent from '../../../toolbox/box/content';
import styles from './overview.css';
import LiskAmount from '../../../shared/liskAmount';
import networks from '../../../../constants/networks';

const Forger = ({ forger }) => (
  <div className={`${styles.forger} forger-item`}>
    <Link to={`${routes.accounts.path}/${forger.address}`}>
      <AccountVisual
        size={36}
        address={forger.address}
        className={styles.accountVisual}
      />
      <span>{forger.username}</span>
    </Link>
  </div>
);

const ForgingDetails = ({
  t, networkStatus, network,
}) => {
  const supply = networkStatus.data.supply;
  const { initialSupply } = Object.values(networks).find(item => (item.name === network.name));
  const totalForged = supply - initialSupply;
  const awaitingForgers = useSelector(state => state.blocks.awaitingForgers);
  const latestBlocks = useSelector(state => state.blocks.latestBlocks);
  const lastForger = awaitingForgers
    .filter(forger =>
      forger.publicKey === latestBlocks[0].generatorPublicKey);
  const next10Forgers = awaitingForgers.filter((item, index) => (
    index < 7 && item.publicKey !== latestBlocks[0].generatorPublicKey
  ));

  return (
    <Box className={styles.wrapper}>
      <BoxHeader>
        <h1>{t('Forging details')}</h1>
      </BoxHeader>
      <BoxContent className={styles.content}>
        <div className={styles.column}>
          <h2 className={styles.title}>{t('Last forger')}</h2>
          <nav className={styles.list}>
            {
              lastForger.length
                ? (
                  <Forger key={lastForger[0].username} forger={lastForger[0]} />
                ) : null
            }
          </nav>
        </div>
        <div className={styles.column}>
          <h2 className={styles.title}>
            <span>{t('Total forged')}</span>
            <Tooltip className={`${styles.tooltip} showOnBottom`}>
              <span>{t('This is an estimated value.')}</span>
            </Tooltip>
          </h2>
          <div className={styles.list}>
            <span className={styles.totalForged}>
              <LiskAmount token="LSK" val={totalForged} />
            </span>
          </div>
        </div>
        <div className={`${styles.column} ${styles.nextForgers}`}>
          <h2 className={styles.title}>{t('Next forgers')}</h2>
          <nav className={styles.list}>
            {
              next10Forgers
                .filter((item, index) => (index < 6))
                .map(forger => (
                  <Forger key={forger.address} forger={forger} />
                ))
            }
          </nav>
        </div>
      </BoxContent>
    </Box>
  );
};

export default ForgingDetails;