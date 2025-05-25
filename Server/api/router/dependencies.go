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
	AuthHandler *handler.AuthHandler
	// Add more handlers here as needed
}

// Repositories contains all repository instances
type Repositories struct {
	FormRepository         repository.FormRepository
	UserRepository         repository.UserRepository
	RefreshTokenRepository repository.RefreshTokenRepository
	// Add more repositories here as needed
}

type Services struct {
	FormService              service.FormService
	FormSubmissionService    service.FormSubmissionService
	FormAuthorizationService service.FormAuthorizationService
	AuthService              service.AuthService
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
	userRepo := repository.NewUserRepository(db)
	refreshTokenRepo := repository.NewRefreshTokenRepository(db)
	return &Repositories{
		FormRepository:         formRepo,
		UserRepository:         userRepo,
		RefreshTokenRepository: refreshTokenRepo,
	}
}

// initServices initializes all services with their required repositories
func initServices(repos *Repositories) *Services {
	formAuthService := service.NewFormAuthorizationService(repos.FormRepository)

	formService := service.NewFormService(repos.FormRepository, formAuthService)

	formSubmissionService := service.NewFormSubmissionService(
		repos.FormRepository,
		formService,
		formAuthService,
	)

	authService := service.NewAuthService(
		repos.UserRepository,
		repos.RefreshTokenRepository,
	)

	return &Services{
		FormService:              formService,
		FormSubmissionService:    formSubmissionService,
		FormAuthorizationService: formAuthService,
		AuthService:              authService,
	}
}

// initHandlers initializes all handlers with their required services
func initHandlers(services *Services) *Handler {
	formHandler := handler.NewFormHandler(
		services.FormService,
		services.FormSubmissionService,
		services.FormAuthorizationService,
		services.AuthService,
	)
	authHandler := handler.NewAuthHandler(services.AuthService)

	return &Handler{
		FormHandler: formHandler,
		AuthHandler: authHandler,
	}
}
