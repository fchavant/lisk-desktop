import React from 'react';
import { mount } from 'enzyme';
import { Time, DateFromTimestamp, TimeFromTimestamp } from './index';

describe('components/toolbox/timestamp', () => {
  const inputValue = 1499983200;

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Time', () => {
    it('renders "5 months" if today is 2017-01-15', () => {
      jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2017-01-15T00:00:00Z'));
      const wrapper = mount(<Time label={inputValue} />);
      expect(wrapper).toHaveText('6 months');
    });
  });

  describe('DateFromTimestamp', () => {
    it('renders "Jul 14, 2017"', () => {
      jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2017-01-15T00:00:00Z'));
      const wrapper = mount(<DateFromTimestamp time={inputValue} />);
      expect(wrapper).toHaveText('Jul 14, 2017');
    });
  });

  describe('TimeFromTimestamp', () => {
    it('renders text matching 12:00:00 AM', () => {
      jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2017-01-15T00:00:00Z'));
      const wrapper = mount(<TimeFromTimestamp time={inputValue} />);
      expect(wrapper.text()).toMatch('12:00:00 AM');
    });
  });
});
