package router

import (
	"github.com/luneto10/voting-system/api/handler"
	"github.com/luneto10/voting-system/internal/repository"
	"github.com/luneto10/voting-system/internal/service"
	"gorm.io/gorm"
)

// Handler contains all API handlers
type Handler struct {
	FormHandler *handler.FormHandler
	// Add more handlers here as needed
}

// Repositories contains all repository instances
type Repositories struct {
	FormRepository *repository.FormRepository
	// Add more repositories here as needed
}

type Services struct {
	FormService *service.FormService
	// Add more services here as needed
}

func initDependencies(db *gorm.DB) *Handler {
	repos := initRepositories(db)

	services := initServices(repos)

	handlers := initHandlers(services)

	return handlers
}

func initRepositories(db *gorm.DB) *Repositories {
	formRepo := repository.NewFormRepository(db)

	return &Repositories{
		FormRepository: formRepo,
	}
}


// initServices initializes all services with their required repositories
func initServices(repos *Repositories) *Services {
	formService := service.NewFormService(repos.FormRepository)

	return &Services{
		FormService: formService,
	}
}

// initHandlers initializes all handlers with their required services
func initHandlers(services *Services) *Handler {
	formHandler := handler.NewFormHandler(services.FormService)

	return &Handler{
		FormHandler: formHandler,
	}
}
