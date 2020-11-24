import debounce from 'lodash.debounce';
import { mountWithRouter } from '../../../utils/testHelpers';
import RegisterDelegate from './registerDelegate';
import { getTransactionBaseFees } from '../../../utils/api/lsk/transactions';

jest.mock('lodash.debounce');
jest.mock('../../../utils/api/lsk/transactions');

getTransactionBaseFees.mockResolvedValue({
  Low: 156,
  Medium: 100,
  High: 51,
});

describe('RegisterDelegate', () => {
  const props = {
    account: {
      info: {
        LSK: {
          address: '123456789L',
          balance: 11000,
        },
      },
    },
    history: {
      push: jest.fn(),
      goBack: jest.fn(),
    },
    prevState: {},
    delegate: {},
    liskAPIClient: {
      delegates: {
        get: jest.fn(),
      },
    },
    delegateRegistered: jest.fn(),
    nextStep: jest.fn(),
    t: key => key,
  };

  beforeEach(() => {
    props.liskAPIClient.delegates.get.mockClear();
    debounce.mockReturnValue((name, error) => !error && props.liskAPIClient.delegates.get(name));
  });

  it('renders properly SelectName component', () => {
    const wrapper = mountWithRouter(RegisterDelegate, props);
    expect(wrapper).toContainMatchingElement('.select-name-container');
    expect(wrapper).toContainMatchingElements(2, '.select-name-text-description');
    expect(wrapper).toContainMatchingElement('.select-name-input');
    expect(wrapper).toContainMatchingElement('.feedback');
    expect(wrapper).toContainMatchingElement('.confirm-btn');
  });
});
