import { Link } from 'react-router-dom';
import React, { useEffect } from 'react';
import { DateTimeFromTimestamp } from '../../../toolbox/timestamp';
import { tokenMap } from '../../../../constants/tokens';
import Box from '../../../toolbox/box';
import BoxHeader from '../../../toolbox/box/header';
import BoxContent from '../../../toolbox/box/content';
import BoxRow from '../../../toolbox/box/row';
import CopyToClipboard from '../../../toolbox/copyToClipboard';
import Feedback from '../../../toolbox/feedback/feedback';
import LabeledValue from '../../../toolbox/labeledValue';
import LiskAmount from '../../../shared/liskAmount';
import TransactionsTable from '../../../shared/transactionsTable';
import routes from '../../../../constants/routes';
import styles from './blockDetails.css';

const BlockDetails = ({
  t, blockDetails, blockTransactions, isMediumViewPort, match,
}) => {
  const token = tokenMap.LSK.key;

  const fields = Object.entries({
    id: {
      label: t('Block ID'),
      value: <CopyToClipboard value={blockDetails.data.id} />,
    },
    height: {
      label: t('Height'),
      value: <CopyToClipboard value={blockDetails.data.height} />,
    },
    version: {
      label: t('Version'),
      value: blockDetails.data.version,
    },
    confirmations: {
      label: t('Confirmations'),
      value: blockDetails.data.confirmations,
    },
    reward: {
      label: t('Reward'),
      value: <LiskAmount val={blockDetails.data.reward} token={token} />,
    },
    totalFee: {
      label: t('Total fee'),
      value: <LiskAmount val={blockDetails.data.totalFee} token={token} />,
    },
    totalForged: {
      label: t('Total forged'),
      value: <LiskAmount val={blockDetails.data.totalForged} token={token} />,
    },
    totalAmount: {
      label: t('Total amount'),
      value: <LiskAmount val={blockDetails.data.totalAmount} token={token} />,
    },
    date: {
      label: t('Date'),
      value: <DateTimeFromTimestamp
        time={blockDetails.data.timestamp * 1000}
        token={tokenMap.BTC.key}
      />,
    },
    generator: {
      label: t('Generated by'),
      value: (
        <Link to={`${routes.accounts.path}/${blockDetails.data.generatorAddress}`}>
          {blockDetails.data.generatorUsername}
        </Link>),
    },
  }).reduce((accumulator, [id, { label, value }]) => ({
    ...accumulator,
    [id]: <LabeledValue label={label} className={styles.dataContainer}>{value}</LabeledValue>,
  }), {});

  const canLoadMore = blockTransactions.meta
    ? blockTransactions.data.length < blockTransactions.meta.total
    : false;

  useEffect(() => {
    blockDetails.loadData();
    blockTransactions.loadData();
  }, [match.url]);

  return (
    <div>
      <Box isLoading={blockDetails.isLoading} width="full">
        <BoxHeader>
          <h1>{t('Block details')}</h1>
        </BoxHeader>
        <BoxContent>
          { blockDetails.error ? (
            <Feedback
              message={t('Failed to load block details.')}
              status="error"
            />
          ) : (
            <React.Fragment>
              {isMediumViewPort ? (
                <div className={styles.container}>
                  {fields.id}
                  {fields.height}
                  {fields.confirmations}
                  {fields.reward}
                  {fields.totalFee}
                  {fields.totalForged}
                  {fields.totalAmount}
                  {fields.date}
                  {fields.generator}
                </div>
              ) : (
                <React.Fragment>
                  <BoxRow>
                    {fields.id}
                    {fields.height}
                    {fields.version}
                    {fields.confirmations}
                    {fields.reward}
                  </BoxRow>
                  <BoxRow>
                    {fields.totalFee}
                    {fields.totalForged}
                    {fields.totalAmount}
                    {fields.date}
                    {fields.generator}
                  </BoxRow>
                </React.Fragment>
              )}
            </React.Fragment>
          ) }
        </BoxContent>
      </Box>
      <TransactionsTable
        title={t('Transactions')}
        transactions={blockTransactions}
        emptyState={{ message: t('There are no transactions for this block.') }}
        canLoadMore={canLoadMore}
      />
    </div>
  );
};

export default BlockDetails;
