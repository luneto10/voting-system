package model

import "gorm.io/gorm"

type Option struct {
	gorm.Model
	Title string `gorm:"not null"`
	Questions []*Question `gorm:"many2many:question_options;"`
}