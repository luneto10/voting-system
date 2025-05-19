package validation

import (
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func FormatErrors(err error) []ValidationError {
	var errors []ValidationError

	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		for _, e := range validationErrors {
			field := strings.ToLower(e.Field())
			var message string

			switch e.Tag() {
			case "required":
				message = fmt.Sprintf("%s is required", field)
			case "min":
				message = fmt.Sprintf("%s must be at least %s characters long", field, e.Param())
			case "max":
				message = fmt.Sprintf("%s must not exceed %s characters", field, e.Param())
			case "gtfield":
				message = fmt.Sprintf("%s must be after %s", field, e.Param())
			default:
				message = fmt.Sprintf("%s is invalid: %s validation failed", field, e.Tag())
			}

			errors = append(errors, ValidationError{
				Field:   field,
				Message: message,
			})
		}
	} else {
		errors = append(errors, ValidationError{
			Field:   "general",
			Message: err.Error(),
		})
	}

	return errors
}
