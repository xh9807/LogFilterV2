import { describe, it, expect } from 'vitest';
import { parseLogLinesWithStats } from '@utils/logParser';
import type { LogLevel } from '@types';

describe('logParser', () => {
  const validHiLogLine = '01-16 14:42:52.788 62125 62125 I A03D00/com.jd.hm.mall/JSAPP: [[1,"banneractiveIndex",1.0]]';

  describe('parseLogLinesWithStats', () => {
    it('应该成功解析有效的 HiLog 日志行', () => {
      const lines = [validHiLogLine];
      const { logs, stats } = parseLogLinesWithStats(lines, 'test.txt');

      expect(stats.parsedLines).toBe(1);
      expect(stats.failedLines).toBe(0);
      expect(logs).toHaveLength(1);
      expect(logs[0].month).toBe(1);
      expect(logs[0].day).toBe(16);
      expect(logs[0].level).toBe('I');
      expect(logs[0].pid).toBe(62125);
      expect(logs[0].tid).toBe(62125);
    });

    it('应该正确解析不同日志等级', () => {
      const levels: LogLevel[] = ['V', 'D', 'I', 'W', 'E', 'F'];
      const lines = levels.map((level, i) => {
        return `01-16 14:42:52.${String(i).padStart(3, '0')} 62125 62125 ${level} Tag${i}: message ${i}`;
      });

      const { logs, stats } = parseLogLinesWithStats(lines, 'test.txt');

      expect(stats.parsedLines).toBe(6);
      expect(stats.failedLines).toBe(0);
      expect(logs).toHaveLength(6);

      logs.forEach((log, i) => {
        expect(log.level).toBe(levels[i]);
      });
    });

    it('应该跳过空行', () => {
      const lines = [
        '',
        '   ',
        validHiLogLine,
        '',
      ];
      const { logs, stats } = parseLogLinesWithStats(lines, 'test.txt');

      expect(stats.parsedLines).toBe(1);
      expect(logs).toHaveLength(1);
    });

    it('应该正确处理解析失败的行', () => {
      const lines = [
        validHiLogLine,
        'invalid log line',
        '01-16 14:42:52.788 62125 62125 I Tag: message',
        'another invalid line',
      ];
      const { logs, stats } = parseLogLinesWithStats(lines, 'test.txt');

      expect(stats.parsedLines).toBe(2);
      expect(stats.failedLines).toBe(2);
      expect(logs).toHaveLength(2);
    });

    it('应该正确设置源文件路径', () => {
      const lines = [validHiLogLine];
      const filePath = '/path/to/test.log';
      const { logs } = parseLogLinesWithStats(lines, filePath);

      expect(logs[0].sourceFile).toBe(filePath);
    });

    it('应该正确设置行号', () => {
      const lines = [
        validHiLogLine,
        'invalid log line',
        validHiLogLine,
      ];
      const { logs } = parseLogLinesWithStats(lines, 'test.txt');

      // 第一行成功解析，行号是1（从1开始）
      expect(logs[0].lineNumber).toBe(1);
      // 第三行成功解析，行号是3
      expect(logs[1].lineNumber).toBe(3);
    });

    it('应该正确提取时间信息', () => {
      const lines = [validHiLogLine];
      const { logs } = parseLogLinesWithStats(lines, 'test.txt');

      expect(logs[0].timestamp).toBe('01-16 14:42:52.788');
      expect(logs[0].date).toBe('01-16');
      expect(logs[0].time).toBe('14:42:52.788');
      expect(logs[0].month).toBe(1);
      expect(logs[0].day).toBe(16);
      expect(logs[0].hours).toBe(14);
      expect(logs[0].minutes).toBe(42);
      expect(logs[0].seconds).toBe(52);
      expect(logs[0].milliseconds).toBe(788);
    });

    it('应该正确提取 Tag 和内容', () => {
      const lines = [validHiLogLine];
      const { logs } = parseLogLinesWithStats(lines, 'test.txt');

      expect(logs[0].tag).toBe('A03D00/com.jd.hm.mall/JSAPP');
      expect(logs[0].content).toBe('[[1,"banneractiveIndex",1.0]]');
    });

    it('应该保留原始日志行', () => {
      const lines = [validHiLogLine];
      const { logs } = parseLogLinesWithStats(lines, 'test.txt');

      expect(logs[0].rawLine).toBe(validHiLogLine);
    });

    it('应该处理包含特殊字符的日志内容', () => {
      const specialLine = '01-16 14:42:52.788 62125 62125 I Tag: 特殊字符测试 @#$%^&*()';
      const lines = [specialLine];
      const { logs, stats } = parseLogLinesWithStats(lines, 'test.txt');

      expect(stats.parsedLines).toBe(1);
      expect(logs[0].content).toBe('特殊字符测试 @#$%^&*()');
    });

    it('应该处理包含特殊字符的日志内容', () => {
      const specialContent = 'Content with \\n newline escape sequence';
      const line = `01-16 14:42:52.788 62125 62125 I Tag: ${specialContent}`;
      const lines = [line];
      const { logs, stats } = parseLogLinesWithStats(lines, 'test.txt');

      expect(stats.parsedLines).toBe(1);
      expect(logs[0].content).toBe(specialContent);
    });

    it('应该正确处理毫秒为0的时间', () => {
      const lineWithZeroMs = '01-16 14:42:52.000 62125 62125 I Tag: message';
      const lines = [lineWithZeroMs];
      const { logs, stats } = parseLogLinesWithStats(lines, 'test.txt');

      expect(stats.parsedLines).toBe(1);
      expect(logs[0].milliseconds).toBe(0);
    });

    it('应该正确处理非常长的日志内容', () => {
      const longContent = 'A'.repeat(10000);
      const line = `01-16 14:42:52.788 62125 62125 I Tag: ${longContent}`;
      const lines = [line];
      const { logs, stats } = parseLogLinesWithStats(lines, 'test.txt');

      expect(stats.parsedLines).toBe(1);
      expect(logs[0].content).toBe(longContent);
    });
  });

  describe('边界情况处理', () => {
    it('应该处理空数组', () => {
      const { logs, stats } = parseLogLinesWithStats([], 'test.txt');

      expect(stats.parsedLines).toBe(0);
      expect(stats.failedLines).toBe(0);
      expect(logs).toHaveLength(0);
    });

    it('应该处理只有空行的数组', () => {
      const lines = ['', '   ', '\t'];
      const { logs, stats } = parseLogLinesWithStats(lines, 'test.txt');

      expect(stats.parsedLines).toBe(0);
      expect(stats.failedLines).toBe(0);
      expect(logs).toHaveLength(0);
    });

    it('应该处理时间解析失败的情况', () => {
      const invalidTimeLine = '99-99 99:99:99.999 62125 62125 I Tag: message';
      const lines = [invalidTimeLine];
      const { logs, stats } = parseLogLinesWithStats(lines, 'test.txt');

      expect(stats.parsedLines).toBe(0);
      expect(stats.failedLines).toBe(1);
      expect(logs).toHaveLength(0);
    });
  });
});
