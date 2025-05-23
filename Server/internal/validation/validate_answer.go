package validation

import (
	"fmt"

	"github.com/luneto10/voting-system/api/dto"
	"github.com/luneto10/voting-system/api/model"
)

func ValidateAnswer(question *model.Question, answer dto.AnswerSubmission) error {
	switch question.Type {
	case model.QuestionTypeSingleChoice:
		if len(answer.OptionIDs) != 1 {
			return fmt.Errorf("single choice question requires exactly one option")
		}
	case model.QuestionTypeMultipleChoice:
		if len(answer.OptionIDs) == 0 {
			return fmt.Errorf("multiple choice question requires at least one option")
		}
	case model.QuestionTypeText:
		if answer.Text == "" {
			return fmt.Errorf("text question requires a text answer")
		}
		if len(answer.OptionIDs) > 0 {
			return fmt.Errorf("text question should not have options")
		}
	}
	return nil
}
