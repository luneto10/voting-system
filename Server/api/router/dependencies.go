package router

import (
	"github.com/luneto10/voting-system/api/handler"
	"github.com/luneto10/voting-system/internal/repository"
	"github.com/luneto10/voting-system/internal/service"
	"gorm.io/gorm"
)

// Handler contains all API handlers
type Handler struct {
	FormHandler      *handler.FormHandler
	AuthHandler      *handler.AuthHandler
	DashboardHandler *handler.DashboardHandler
	DraftHandler     *handler.DraftHandler
}

// Repositories contains all repository instances
type Repositories struct {
	FormRepository         repository.FormRepository
	UserRepository         repository.UserRepository
	RefreshTokenRepository repository.RefreshTokenRepository
	DashboardRepository    repository.DashboardRepository
	DraftRepository        repository.DraftRepository
}

type Services struct {
	FormService              service.FormService
	FormSubmissionService    service.FormSubmissionService
	FormAuthorizationService service.FormAuthorizationService
	AuthService              service.AuthService
	DashboardService         service.DashboardService
	DraftService             service.DraftService
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
	dashboardRepo := repository.NewDashboardRepository(db)
	draftRepo := repository.NewDraftRepository(db)

	return &Repositories{
		FormRepository:         formRepo,
		UserRepository:         userRepo,
		RefreshTokenRepository: refreshTokenRepo,
		DashboardRepository:    dashboardRepo,
		DraftRepository:        draftRepo,
	}
}

// initServices initializes all services with their required repositories
func initServices(repos *Repositories) *Services {
	formAuthService := service.NewFormAuthorizationService(repos.FormRepository)

	formService := service.NewFormService(repos.FormRepository, formAuthService)

	dashboardService := service.NewDashboardService(
		repos.DashboardRepository,
		repos.DraftRepository,
		repos.FormRepository,
	)

	formSubmissionService := service.NewFormSubmissionService(
		repos.FormRepository,
		formService,
		formAuthService,
		dashboardService,
	)

	authService := service.NewAuthService(
		repos.UserRepository,
		repos.RefreshTokenRepository,
	)

	draftService := service.NewDraftService(
		repos.DraftRepository,
		repos.FormRepository,
	)

	return &Services{
		FormService:              formService,
		FormSubmissionService:    formSubmissionService,
		FormAuthorizationService: formAuthService,
		AuthService:              authService,
		DashboardService:         dashboardService,
		DraftService:             draftService,
	}
}

// initHandlers initializes all handlers with their required services
func initHandlers(services *Services) *Handler {
	formHandler := handler.NewFormHandler(
		services.FormService,
		services.FormSubmissionService,
		services.FormAuthorizationService,
		services.AuthService,
		services.DashboardService,
	)
	authHandler := handler.NewAuthHandler(services.AuthService)
	dashboardHandler := handler.NewDashboardHandler(services.DashboardService)
	draftHandler := handler.NewDraftHandler(services.DraftService, services.DashboardService)

	return &Handler{
		FormHandler:      formHandler,
		AuthHandler:      authHandler,
		DashboardHandler: dashboardHandler,
		DraftHandler:     draftHandler,
	}
}
