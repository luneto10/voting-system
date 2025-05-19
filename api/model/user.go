package model

import "gorm.io/gorm"

type UserRole string

const (
	UserRoleAdmin UserRole = "admin"
	UserRoleUser  UserRole = "user"
)

type User struct {
	gorm.Model
	Email string `gorm:"not null;unique"`
	Password string `gorm:"not null"`
	Role UserRole `gorm:"not null;default:user"`
	Answers []Answer `gorm:"foreignKey:UserID"`
}