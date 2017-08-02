import React from 'react';
import { TooltipWrapper } from '../timestamp';
import sytles from './transactions.css';
import ClickToSend from '../send/clickToSend';

const TransactionType = (props) => {
  let type;
  switch (props.type) {
    case 1:
      type = 'Second Signature Creation';
      break;
    case 2:
      type = 'Delegate Registration';
      break;
    case 3:
      type = 'Vote';
      break;
    case 4:
      type = 'Multisignature Creation';
      break;
    case 5:
      type = 'Blockchain Application Registration';
      break;
    case 6:
      type = 'Send Lisk to Blockchain Application';
      break;
    case 7:
      type = 'Send Lisk from Blockchain Application';
      break;
    default:
      type = false;
      break;
  }
  const template = type ?
    <span className={sytles.smallButton}>{type}</span> :
    <ClickToSend recipient={props.senderId} >
      <TooltipWrapper tooltip="Send to this recipient">{props.senderId}</TooltipWrapper>
    </ClickToSend>;
  return template;
};

export default TransactionType;
