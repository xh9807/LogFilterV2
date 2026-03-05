/**
 * 日志等级枚举
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel["VERBOSE"] = "V";
    LogLevel["DEBUG"] = "D";
    LogLevel["INFO"] = "I";
    LogLevel["WARN"] = "W";
    LogLevel["ERROR"] = "E";
    LogLevel["FATAL"] = "F";
})(LogLevel || (LogLevel = {}));
/**
 * 日志等级颜色映射
 */
export const LOG_LEVEL_CONFIGS = {
    [LogLevel.VERBOSE]: {
        level: LogLevel.VERBOSE,
        label: 'Verbose',
        color: '#8c8c8c',
        backgroundColor: '#f5f5f5',
        icon: 'V',
    },
    [LogLevel.DEBUG]: {
        level: LogLevel.DEBUG,
        label: 'Debug',
        color: '#52c41a',
        backgroundColor: '#f6ffed',
        icon: 'D',
    },
    [LogLevel.INFO]: {
        level: LogLevel.INFO,
        label: 'Info',
        color: '#1890ff',
        backgroundColor: '#e6f7ff',
        icon: 'I',
    },
    [LogLevel.WARN]: {
        level: LogLevel.WARN,
        label: 'Warn',
        color: '#faad14',
        backgroundColor: '#fffbe6',
        icon: 'W',
    },
    [LogLevel.ERROR]: {
        level: LogLevel.ERROR,
        label: 'Error',
        color: '#ff4d4f',
        backgroundColor: '#fff1f0',
        icon: 'E',
    },
    [LogLevel.FATAL]: {
        level: LogLevel.FATAL,
        label: 'Fatal',
        color: '#cf1322',
        backgroundColor: '#fff1f0',
        icon: 'F',
    },
};
