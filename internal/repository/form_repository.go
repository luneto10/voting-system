package repository

import (
	"github.com/luneto10/voting-system/api/model"
	"gorm.io/gorm"
)

type FormRepository interface {
	CreateForm(form *model.Form) error
	GetForm(id string) (*model.Form, error)
	UpdateForm(id string, form *model.Form) error
	DeleteForm(id string) error
}

type FormRepositoryImpl struct {
	db *gorm.DB
}

func NewFormRepository(db *gorm.DB) FormRepository {
	return &FormRepositoryImpl{db: db}
}

func (r *FormRepositoryImpl) CreateForm(form *model.Form) error {
	return r.db.Create(form).Error
}

func (r *FormRepositoryImpl) GetForm(id string) (*model.Form, error) {
	var form model.Form
	if err := r.db.
		Preload("Questions.Options").
		First(&form, id).Error; err != nil {
		return nil, err
	}
	return &form, nil
}

func (r *FormRepositoryImpl) UpdateForm(id string, form *model.Form) error {
	return r.db.Save(form).Error
}

func (r *FormRepositoryImpl) DeleteForm(id string) error {
	return r.db.Delete(&model.Form{}, id).Error
}
