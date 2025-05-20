package db

import (
	"fmt"

	"github.com/luneto10/voting-system/api/model"
	"github.com/luneto10/voting-system/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// NewDB initializes a new database connection using the provided DBConfig.
func InitializePostgres(cfg config.DBConfig) (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.DBName)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("error initializing postgres: %v", err)
	}

	db.AutoMigrate(
		&model.Form{},
		&model.Question{},
		&model.Option{},
		&model.Answer{},
		&model.User{},
		&model.Submission{},
	)

	return db, nil
}
