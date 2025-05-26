package db

import (
	"fmt"

	"github.com/luneto10/voting-system/api/model"
	"github.com/luneto10/voting-system/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Database interface {
	GetDB() *gorm.DB
	Close() error
}

// PostgresDB implements the Database interface
type PostgresDB struct {
	db *gorm.DB
}

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
		&model.RefreshToken{},
		&model.DraftSubmission{},
		&model.UserFormParticipation{},
	)

	return db, nil
}

func (p *PostgresDB) GetDB() *gorm.DB {
	return p.db
}

func (p *PostgresDB) Close() error {
	sqlDB, err := p.db.DB()
	if err != nil {
		return fmt.Errorf("error getting underlying *sql.DB: %v", err)
	}
	return sqlDB.Close()
}
