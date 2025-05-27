import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { formsApi, ApiError, UpdateFormRequest } from '@/lib/api';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

const questionSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, 'Question title is required'),
  type: z.enum(['single_choice', 'multiple_choice', 'text']),
  options: z.array(
    z.object({
      id: z.number().optional(),
      title: z.string().min(1, 'Option title is required'),
    })
  ).optional().nullable(),
});

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startAt: z.date().nullable().optional(),
  endAt: z.date().nullable().optional(),
  questions: z.array(questionSchema).min(1, 'At least one question is required'),
}).refine((data) => {
  if (!data.startAt || !data.endAt) return true;
  return data.endAt > data.startAt;
}, {
  message: "End date must be after start date",
  path: ["endAt"],
});

type FormValues = z.infer<typeof formSchema>;

export default function EditPoll() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [date, setDate] = useState<DateRange | undefined>();
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<number[]>([]);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const { data: form, isLoading } = useQuery({
    queryKey: ['form', id],
    queryFn: () => formsApi.getById(Number(id)),
    enabled: !!id,
  });

  const formInstance = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      startAt: null,
      endAt: null,
      questions: [
        {
          title: '',
          type: 'single_choice',
          options: [{ title: '' }],
        },
      ],
    },
  });

  const { fields, append, remove: removeQuestion } = useFieldArray({
    control: formInstance.control,
    name: 'questions',
  });

  useEffect(() => {
    if (form?.data) {
      const formData = form.data;
      const startDate = formData.startAt ? new Date(formData.startAt) : null;
      const endDate = formData.endAt ? new Date(formData.endAt) : null;

      formInstance.reset({
        title: formData.title,
        description: formData.description || '',
        startAt: startDate,
        endAt: endDate,
        questions: formData.questions.map(q => ({
          id: q.id,
          title: q.title,
          type: q.type,
          options: q.options?.map(o => ({
            id: o.id,
            title: o.title,
          })) || [],
        })),
      });

      if (startDate && endDate) {
        setDate({
          from: startDate,
          to: endDate,
        });
      }
    }
  }, [form?.data, formInstance]);

  const updatePollMutation = useMutation({
    mutationFn: (data: UpdateFormRequest) => formsApi.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['form', id] });
      toast.success('Poll updated successfully');
      navigate('/polls');
    },
    onError: (error: any) => {
      const apiError = error.response?.data as ApiError;
      if (apiError?.errors) {
        apiError.errors.forEach((err: { field: string; message: string }) => {
          formInstance.setError(err.field as any, {
            type: 'manual',
            message: err.message,
          });
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to update poll');
      }
    },
  });

  const handleRemoveQuestion = (questionIndex: number) => {
    const question = formInstance.getValues(`questions.${questionIndex}`);
    if (question.id) {
      setDeletedQuestionIds(prev => [...prev, question.id as number]);
    }
    removeQuestion(questionIndex);
  };

  const onSubmit = (data: FormValues) => {
    const formattedData: UpdateFormRequest = {
      title: data.title,
      description: data.description || undefined,
      startAt: data.startAt?.toISOString() || null,
      endAt: data.endAt?.toISOString() || null,
      questions: data.questions.map(question => {
        if (question.type === 'text') {
          return {
            id: question.id,
            title: question.title,
            type: question.type
          };
        }
        return {
          ...question,
          options: question.options?.map(option => ({
            id: option.id,
            title: option.title,
          })),
        };
      }),
      deletedQuestionIds: deletedQuestionIds.length > 0 ? deletedQuestionIds : undefined
    };
    
    updatePollMutation.mutate(formattedData);
  };

  const addQuestion = () => {
    append({
      title: '',
      type: 'single_choice',
      options: [{ title: '' }],
    });
  };

  const addOption = (questionIndex: number) => {
    const currentOptions = formInstance.getValues(`questions.${questionIndex}.options`) || [];
    formInstance.setValue(`questions.${questionIndex}.options`, [
      ...currentOptions,
      { title: '' },
    ]);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const currentOptions = formInstance.getValues(`questions.${questionIndex}.options`) || [];
    formInstance.setValue(
      `questions.${questionIndex}.options`,
      currentOptions.filter((_, i) => i !== optionIndex)
    );
  };

  const handleQuestionTypeChange = (questionIndex: number, type: 'single_choice' | 'multiple_choice' | 'text') => {
    if (type === 'text') {
      formInstance.setValue(`questions.${questionIndex}.options`, undefined);
    } else {
      const currentOptions = formInstance.getValues(`questions.${questionIndex}.options`);
      if (!currentOptions || currentOptions.length === 0) {
        formInstance.setValue(`questions.${questionIndex}.options`, [{ title: '' }]);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-6 overflow-x-hidden">
      <div className="w-full max-w-3xl px-2">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Edit Poll</h1>
          <Button variant="outline" onClick={() => navigate('/polls')}>
            Cancel
          </Button>
        </div>

        <Form {...formInstance}>
          <form onSubmit={formInstance.handleSubmit(onSubmit)} className="space-y-4 w-full">
            <Card className="w-full">
              <CardHeader className="px-4 py-3">
                <CardTitle>Poll Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4">
                <FormField
                  control={formInstance.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter poll title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formInstance.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter poll description"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formInstance.control}
                  name="startAt"
                  render={() => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date Range</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            {date?.from ? (
                              date.to ? (
                                <>
                                  {format(date.from, "LLL dd, y")} -{" "}
                                  {format(date.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(date.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Pick a date range</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={(range) => {
                              setDate(range);
                              if (range?.from) {
                                formInstance.setValue('startAt', range.from);
                              }
                              if (range?.to) {
                                formInstance.setValue('endAt', range.to);
                              }
                            }}
                            numberOfMonths={isDesktop ? 2 : 1}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return date < today || date > new Date("2100-01-01");
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardHeader className="px-4 py-3">
                <CardTitle>Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4">
                {fields.map((field, questionIndex) => (
                  <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Question {questionIndex + 1}</h3>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveQuestion(questionIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <FormField
                      control={formInstance.control}
                      name={`questions.${questionIndex}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter question" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={formInstance.control}
                      name={`questions.${questionIndex}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question Type</FormLabel>
                          <Select
                            onValueChange={(value: 'single_choice' | 'multiple_choice' | 'text') => {
                              field.onChange(value);
                              handleQuestionTypeChange(questionIndex, value);
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select question type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="single_choice">
                                Single Choice
                              </SelectItem>
                              <SelectItem value="multiple_choice">
                                Multiple Choice
                              </SelectItem>
                              <SelectItem value="text">Text</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {formInstance.watch(`questions.${questionIndex}.type`) !== 'text' && (
                      <div className="space-y-2">
                        <FormLabel>Options</FormLabel>
                        {formInstance.watch(`questions.${questionIndex}.options`)?.map(
                          (_, optionIndex) => (
                            <div key={optionIndex} className="flex gap-2">
                              <FormField
                                control={formInstance.control}
                                name={`questions.${questionIndex}.options.${optionIndex}.title`}
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormControl>
                                      <Input
                                        placeholder={`Option ${optionIndex + 1}`}
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              {(formInstance.watch(`questions.${questionIndex}.options`) || []).length >
                                1 && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  onClick={() =>
                                    removeOption(questionIndex, optionIndex)
                                  }
                                >
                                  ×
                                </Button>
                              )}
                            </div>
                          )
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(questionIndex)}
                          className="w-full"
                        >
                          Add Option
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addQuestion}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/polls')}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={updatePollMutation.isPending}
              >
                {updatePollMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
} 