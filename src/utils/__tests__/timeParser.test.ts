import { describe, it, expect } from 'vitest';
import {
  parseHiLogTime,
  timeToMilliseconds,
  compareTime,
  isTimeAfter,
  isTimeBefore,
  isTimeEqual,
  isTimeAfterOrEqual,
  isTimeBeforeOrEqual,
  formatHiLogTime,
  getCurrentTime,
  isValidTime,
} from '@utils/timeParser';

describe('timeParser', () => {
  describe('parseHiLogTime', () => {
    it('应该正确解析完整的 HiLog 时间格式', () => {
      const timeString = '01-16 14:42:52.788';
      const result = parseHiLogTime(timeString);

      expect(result).not.toBeNull();
      expect(result?.month).toBe(1);
      expect(result?.day).toBe(16);
      expect(result?.hours).toBe(14);
      expect(result?.minutes).toBe(42);
      expect(result?.seconds).toBe(52);
      expect(result?.milliseconds).toBe(788);
    });

    it('应该正确解析只有时间的格式', () => {
      const timeString = '14:42:52.788';
      const result = parseHiLogTime(timeString);

      expect(result).not.toBeNull();
      expect(result?.month).toBe(1); // 默认值
      expect(result?.day).toBe(1); // 默认值
      expect(result?.hours).toBe(14);
      expect(result?.minutes).toBe(42);
      expect(result?.seconds).toBe(52);
      expect(result?.milliseconds).toBe(788);
    });

    it('应该返回 null 对于无效的时间格式', () => {
      const result = parseHiLogTime('invalid-time');
      expect(result).toBeNull();
    });
  });

  describe('timeToMilliseconds', () => {
    it('应该正确计算 1月1日的毫秒数', () => {
      const time = {
        month: 1,
        day: 1,
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      };
      const result = timeToMilliseconds(time);
      expect(result).toBe(0);
    });

    it('应该正确计算 1月2日的毫秒数', () => {
      const time = {
        month: 1,
        day: 2,
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      };
      const result = timeToMilliseconds(time);
      expect(result).toBe(24 * 60 * 60 * 1000);
    });

    it('应该正确计算跨天的时间', () => {
      const time = {
        month: 1,
        day: 1,
        hours: 12,
        minutes: 30,
        seconds: 0,
        milliseconds: 0,
      };
      const result = timeToMilliseconds(time);
      expect(result).toBe(12 * 60 * 60 * 1000 + 30 * 60 * 1000);
    });
  });

  describe('compareTime', () => {
    const time1 = {
      month: 1,
      day: 1,
      hours: 10,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    };

    const time2 = {
      month: 1,
      day: 1,
      hours: 12,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    };

    const time3 = {
      month: 1,
      day: 1,
      hours: 10,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    };

    it('应该返回 -1 当 time1 < time2', () => {
      expect(compareTime(time1, time2)).toBe(-1);
    });

    it('应该返回 1 当 time1 > time2', () => {
      expect(compareTime(time2, time1)).toBe(1);
    });

    it('应该返回 0 当 time1 === time3', () => {
      expect(compareTime(time1, time3)).toBe(0);
    });
  });

  describe('时间比较函数', () => {
    const earlierTime = {
      month: 1,
      day: 15,
      hours: 8,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    };

    const laterTime = {
      month: 1,
      day: 16,
      hours: 14,
      minutes: 30,
      seconds: 0,
      milliseconds: 0,
    };

    it('isTimeAfter 应该正确判断时间先后', () => {
      expect(isTimeAfter(laterTime, earlierTime)).toBe(true);
      expect(isTimeAfter(earlierTime, laterTime)).toBe(false);
    });

    it('isTimeBefore 应该正确判断时间先后', () => {
      expect(isTimeBefore(earlierTime, laterTime)).toBe(true);
      expect(isTimeBefore(laterTime, earlierTime)).toBe(false);
    });

    it('isTimeEqual 应该正确判断时间相等', () => {
      expect(isTimeEqual(earlierTime, earlierTime)).toBe(true);
      expect(isTimeEqual(earlierTime, laterTime)).toBe(false);
    });

    it('isTimeAfterOrEqual 应该包含等于的情况', () => {
      expect(isTimeAfterOrEqual(laterTime, earlierTime)).toBe(true);
      expect(isTimeAfterOrEqual(earlierTime, earlierTime)).toBe(true);
      expect(isTimeAfterOrEqual(earlierTime, laterTime)).toBe(false);
    });

    it('isTimeBeforeOrEqual 应该包含等于的情况', () => {
      expect(isTimeBeforeOrEqual(earlierTime, laterTime)).toBe(true);
      expect(isTimeBeforeOrEqual(earlierTime, earlierTime)).toBe(true);
      expect(isTimeBeforeOrEqual(laterTime, earlierTime)).toBe(false);
    });
  });

  describe('formatHiLogTime', () => {
    it('应该正确格式化带日期的时间', () => {
      const time = {
        month: 1,
        day: 16,
        hours: 14,
        minutes: 42,
        seconds: 52,
        milliseconds: 788,
      };
      const result = formatHiLogTime(time, true);
      expect(result).toBe('01-16 14:42:52.788');
    });

    it('应该正确格式化不带日期的时间', () => {
      const time = {
        month: 1,
        day: 16,
        hours: 14,
        minutes: 42,
        seconds: 52,
        milliseconds: 788,
      };
      const result = formatHiLogTime(time, false);
      expect(result).toBe('14:42:52.788');
    });

    it('应该正确处理毫秒为0的情况', () => {
      const time = {
        month: 1,
        day: 16,
        hours: 14,
        minutes: 42,
        seconds: 52,
        milliseconds: 0,
      };
      const result = formatHiLogTime(time, true);
      expect(result).toBe('01-16 14:42:52.000');
    });
  });

  describe('isValidTime', () => {
    it('应该验证有效的时间', () => {
      const validTime = {
        month: 6,
        day: 15,
        hours: 14,
        minutes: 30,
        seconds: 45,
        milliseconds: 500,
      };
      expect(isValidTime(validTime)).toBe(true);
    });

    it('应该拒绝无效的月份', () => {
      const invalidMonth = {
        month: 13,
        day: 15,
        hours: 14,
        minutes: 30,
        seconds: 45,
      };
      expect(isValidTime(invalidMonth)).toBe(false);
    });

    it('应该拒绝无效的日', () => {
      const invalidDay = {
        month: 6,
        day: 32,
        hours: 14,
        minutes: 30,
        seconds: 45,
      };
      expect(isValidTime(invalidDay)).toBe(false);
    });

    it('应该拒绝无效的小时', () => {
      const invalidHours = {
        month: 6,
        day: 15,
        hours: 24,
        minutes: 30,
        seconds: 45,
      };
      expect(isValidTime(invalidHours)).toBe(false);
    });

    it('应该拒绝无效的分钟', () => {
      const invalidMinutes = {
        month: 6,
        day: 15,
        hours: 14,
        minutes: 60,
        seconds: 45,
      };
      expect(isValidTime(invalidMinutes)).toBe(false);
    });

    it('应该拒绝无效的秒', () => {
      const invalidSeconds = {
        month: 6,
        day: 15,
        hours: 14,
        minutes: 30,
        seconds: 60,
      };
      expect(isValidTime(invalidSeconds)).toBe(false);
    });

    it('应该拒绝无效的毫秒', () => {
      const invalidMilliseconds = {
        month: 6,
        day: 15,
        hours: 14,
        minutes: 30,
        seconds: 45,
        milliseconds: 1000,
      };
      expect(isValidTime(invalidMilliseconds)).toBe(false);
    });
  });

  describe('getCurrentTime', () => {
    it('应该返回当前时间对象', () => {
      const now = new Date();
      const currentTime = getCurrentTime();

      expect(currentTime.month).toBe(now.getMonth() + 1);
      expect(currentTime.day).toBe(now.getDate());
      expect(currentTime.hours).toBe(now.getHours());
      expect(currentTime.minutes).toBe(now.getMinutes());
      expect(currentTime.seconds).toBe(now.getSeconds());
      expect(currentTime.milliseconds).toBeGreaterThanOrEqual(0);
      expect(currentTime.milliseconds).toBeLessThan(1000);
    });
  });
});
