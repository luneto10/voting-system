package config

import (
	"fmt"

	"github.com/luneto10/voting-system/api/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type DBConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

func InitializePostgres() (*gorm.DB, error) {
	logger := NewLogger("Postgres")
	config := GetConfig()
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		config.Host, config.Port, config.User, config.Password, config.DBName)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		logger.Errorf("error initializing postgres: %v", err)
		return nil, fmt.Errorf("error initializing postgres: %v", err)
	}

	logger.Infof("postgres initialized successfully")

	db.AutoMigrate(&model.Form{})

	return db, nil
}
