package repository

import (
	"github.com/luneto10/voting-system/api/model"
	"gorm.io/gorm"
)

type FormRepository struct {
	db *gorm.DB
}

func NewFormRepository(db *gorm.DB) *FormRepository {
	return &FormRepository{db: db}
}

func (r *FormRepository) CreateForm(form *model.Form) error {
	return r.db.Create(form).Error
}

func (r *FormRepository) GetForm(id string) (*model.Form, error) {
	var form model.Form
	if err := r.db.First(&form, id).Error; err != nil {
		return nil, err
	}
	return &form, nil
}