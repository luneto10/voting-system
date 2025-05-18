package config

import (
	"fmt"

	"gorm.io/gorm"
)

var (
	db     *gorm.DB
	logger *Logger
)

func Init() error {
	if err := LoadEnv(); err != nil {
		logger.Errorf("error loading environment variables: %v", err)
	}

	var err error
	if db, err = InitializePostgres(); err != nil {
		return fmt.Errorf("error initializing postgres %v", err)
	}
	return nil
}

func GetPostgres() *gorm.DB {
	return db
}

func GetLogger(p string) *Logger {
	//Init logger
	logger := NewLogger(p)
	return logger
}
