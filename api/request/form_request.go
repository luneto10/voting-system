package request

import (
	"github.com/go-playground/validator/v10"
)

type CreateFormRequest struct {
	Title string `json:"title" validate:"required,min=5,max=100"`
}

func (r *CreateFormRequest) Validate() error {
	validate := validator.New()
	return validate.Struct(r)
}

type UpdateFormRequest struct {
	Title string `json:"title" validate:"omitempty,min=5,max=100"`
}

func (r *UpdateFormRequest) Validate() error {
	validate := validator.New()
	return validate.Struct(r)
}
