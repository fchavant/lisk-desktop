import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '../toolbox/dialog/dialog';
import FlashMessageHolder from '../toolbox/flashMessage/holder';
import { PrimaryButton, SecondaryButton } from '../toolbox/buttons/button';
import externalLinks from '../../constants/externalLinks';
import styles from './analyticsDialog.css';

class AnalyticsDialog extends React.Component {
  constructor() {
    super();

    this.handleClickAccept = this.handleClickAccept.bind(this);
    this.handleClickCancel = this.handleClickCancel.bind(this);
  }

  handleClickAccept() {
    const { toastDisplayed, settingsUpdated, t } = this.props;
    settingsUpdated({ statistics: true });
    toastDisplayed({ label: t('Settings saved!') });
    FlashMessageHolder.deleteMessage('Analytics');
  }

  // eslint-disable-next-line class-methods-use-this
  handleClickCancel() {
    // time logic
    FlashMessageHolder.deleteMessage('Analytics');
  }

  render() {
    const { t } = this.props;
    return (
      <Dialog hasClose>
        <Dialog.Title>
          {t('Anonymous Data Collection')}
        </Dialog.Title>
        <Dialog.Description>
          <p>
            {
              t(`We would like to request permission for collecting anonymous data in order 
              to improve our UI products. The data will be stored in our servers however, it will 
              not include sensitive information related to your Lisk Account.`)
            }
          </p>
          <p className={styles.learnMore}>
            { t('You can learn more in our') }
            <a
              className={styles.link}
              target="_blank"
              href={externalLinks.privacyPolicy}
            >
              {t('Privacy Policy')}
            </a>
          </p>
        </Dialog.Description>

        <Dialog.Options align="center">
          <SecondaryButton onClick={this.handleClickCancel} className={styles.buttons}>
            {t('Cancel')}
          </SecondaryButton>
          <PrimaryButton onClick={this.handleClickAccept} className={styles.buttons}>
            {t('Accept')}
          </PrimaryButton>
        </Dialog.Options>
      </Dialog>
    );
  }
}

AnalyticsDialog.propTypes = {
  t: PropTypes.func.isRequired,
};

export default AnalyticsDialog;
