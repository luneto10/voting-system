package dto

type CreateFormRequest struct {
	Title string `json:"title" binding:"required,min=5,max=100"`
}

type UpdateFormRequest struct {
	Title *string `json:"title" binding:"omitempty,min=5,max=100"`
}

type GetFormResponse struct {
	ID    uint   `json:"id"`
	Title string `json:"title"`
}
