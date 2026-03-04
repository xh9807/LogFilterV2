import { parseLogLine, parseLogLinesWithStats, validateLogFormat, extractLogLevel } from './logParser';

// 测试用的HiLog日志示例
const SAMPLE_LOGS = [
  '01-16 14:42:52.788 62125 62125 I A03D00/com.jd.hm.mall/JSAPP: [[1,"banneractiveIndex",1.0]]',
  '01-16 14:42:53.100 62125 62125 D Network: Request started',
  '01-16 14:42:54.500 62125 62125 W Memory: Memory warning',
  '01-16 14:42:55.000 62125 62125 E Crash: NullPointerException',
  '01-16 14:42:56.123 62125 62125 F Fatal: Application crashed',
  '01-16 14:42:57.000 62125 62125 V Verbose: Detailed debug info',
  // 错误格式
  'invalid log line',
  '',
  // 格式错误的日志
  '01-16 14:42:52 62125 62125 I Tag: Content without milliseconds',
];

// 测试解析单行日志
function testParseLogLine() {
  console.log('=== 测试 parseLogLine ===');

  const logLine = SAMPLE_LOGS[0];
  const entry = parseLogLine(logLine, 'test.log', 1);

  if (entry) {
    console.log('✅ 解析成功:');
    console.log('  时间戳:', entry.timestamp);
    console.log('  日期:', entry.date);
    console.log('  时间:', entry.time);
    console.log('  月/日:', entry.month, '/', entry.day);
    console.log('  时:分:秒.毫秒:', entry.hours, ':', entry.minutes, ':', entry.seconds, '.', entry.milliseconds);
    console.log('  PID:', entry.pid);
    console.log('  TID:', entry.tid);
    console.log('  等级:', entry.level);
    console.log('  Tag:', entry.tag);
    console.log('  内容:', entry.content);
  } else {
    console.log('❌ 解析失败');
  }

  console.log('');
}

// 测试批量解析
function testParseLogLinesWithStats() {
  console.log('=== 测试 parseLogLinesWithStats ===');

  const result = parseLogLinesWithStats(SAMPLE_LOGS, 'test.log');

  console.log('✅ 批量解析完成:');
  console.log('  总行数:', result.stats.totalLines);
  console.log('  解析成功:', result.stats.parsedLines);
  console.log('  解析失败:', result.stats.failedLines);
  console.log('  空行:', result.stats.emptyLines);
  console.log('  等级统计:');
  console.log('    Verbose:', result.stats.levelCounts.V);
  console.log('    Debug:', result.stats.levelCounts.D);
  console.log('    Info:', result.stats.levelCounts.I);
  console.log('    Warn:', result.stats.levelCounts.W);
  console.log('    Error:', result.stats.levelCounts.E);
  console.log('    Fatal:', result.stats.levelCounts.F);

  console.log('');
}

// 测试格式验证
function testValidateLogFormat() {
  console.log('=== 测试 validateLogFormat ===');

  const validLog = SAMPLE_LOGS[0];
  const invalidLog = SAMPLE_LOGS[6];

  console.log('有效日志:', validateLogFormat(validLog) ? '✅' : '❌');
  console.log('无效日志:', validateLogFormat(invalidLog) ? '❌' : '✅');

  console.log('');
}

// 测试提取日志等级
function testExtractLogLevel() {
  console.log('=== 测试 extractLogLevel ===');

  const levels: string[] = ['V', 'D', 'I', 'W', 'E', 'F'];

  levels.forEach((level, index) => {
    const log = `01-16 14:42:52.788 62125 62125 ${level} Tag: Content`;
    const extractedLevel = extractLogLevel(log);
    console.log(`日志等级 ${level}: ${extractedLevel === level ? '✅' : '❌'}`);
  });

  console.log('');
}

// 运行所有测试
export function runLogParserTests() {
  console.log('🧪 开始运行日志解析器测试...\n');

  testParseLogLine();
  testParseLogLinesWithStats();
  testValidateLogFormat();
  testExtractLogLevel();

  console.log('✅ 所有测试完成!');
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined') {
  runLogParserTests();
}
