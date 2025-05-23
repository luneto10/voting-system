package log

import (
	"io"
	"log"
	"os"

	"github.com/luneto10/voting-system/config"
)

// Logger wraps the standard log.Logger with additional methods.
type Logger struct {
	debug   *log.Logger
	info    *log.Logger
	warning *log.Logger
	err     *log.Logger
	writer  io.Writer
}

// NewLogger initializes a new logger using the provided LogConfig.
func NewLogger(cfg config.LogConfig) *Logger {
	writer := io.Writer(os.Stdout)
	logger := log.New(writer, "", log.Ldate|log.Ltime)

	return &Logger{
		debug:   log.New(writer, "DEBUG: ", logger.Flags()),
		info:    log.New(writer, "INFO: ", logger.Flags()),
		warning: log.New(writer, "WARNING: ", logger.Flags()),
		err:     log.New(writer, "ERROR: ", logger.Flags()),
		writer:  writer,
	}
}

// Debug logs a debug message.
func (l *Logger) Debug(v ...any) {
	l.debug.Println(v...)
}

// Info logs an info message.
func (l *Logger) Info(v ...any) {
	l.info.Println(v...)
}

// Warning logs a warning message.
func (l *Logger) Warning(v ...any) {
	l.warning.Println(v...)
}

// Error logs an error message.
func (l *Logger) Error(v ...any) {
	l.err.Println(v...)
}

// Debugf logs a formatted debug message.
func (l *Logger) Debugf(format string, v ...any) {
	l.debug.Printf(format, v...)
}

// Infof logs a formatted info message.
func (l *Logger) Infof(format string, v ...any) {
	l.info.Printf(format, v...)
}

// Warningf logs a formatted warning message.
func (l *Logger) Warningf(format string, v ...any) {
	l.warning.Printf(format, v...)
}

// Errorf logs a formatted error message.
func (l *Logger) Errorf(format string, v ...any) {
	l.err.Printf(format, v...)
}
