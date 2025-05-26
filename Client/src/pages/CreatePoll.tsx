import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Plus, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { formsApi, ApiError } from '@/lib/api';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';

const questionSchema = z.object({
  title: z.string().min(1, 'Question title is required'),
  type: z.enum(['single_choice', 'multiple_choice', 'text']),
  options: z.array(
    z.object({
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

export default function CreatePoll() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [date, setDate] = useState<DateRange | undefined>();

  const form = useForm<FormValues>({
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const createPollMutation = useMutation({
    mutationFn: formsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast.success('Poll created successfully');
      navigate('/polls');
    },
    onError: (error: any) => {
      const apiError = error.response?.data as ApiError;
      if (apiError?.errors) {
        apiError.errors.forEach((err: { field: string; message: string }) => {
          form.setError(err.field as any, {
            type: 'manual',
            message: err.message,
          });
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to create poll');
      }
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log('Form data before formatting:', data);
    
    const formattedData = {
      ...data,
      startAt: data.startAt?.toISOString() || null,
      endAt: data.endAt?.toISOString() || null,
      questions: data.questions.map(question => {
        if (question.type === 'text') {
          return {
            title: question.title,
            type: question.type
          };
        }
        return question;
      })
    };
    
    console.log('Formatted data:', formattedData);
    createPollMutation.mutate(formattedData);
  };

  const addQuestion = () => {
    append({
      title: '',
      type: 'single_choice',
      options: [{ title: '' }],
    });
  };

  const addOption = (questionIndex: number) => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`) || [];
    form.setValue(`questions.${questionIndex}.options`, [
      ...currentOptions,
      { title: '' },
    ]);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`) || [];
    form.setValue(
      `questions.${questionIndex}.options`,
      currentOptions.filter((_, i) => i !== optionIndex)
    );
  };

  const handleQuestionTypeChange = (questionIndex: number, type: 'single_choice' | 'multiple_choice' | 'text') => {
    if (type === 'text') {
      form.setValue(`questions.${questionIndex}.options`, undefined);
    } else {
      const currentOptions = form.getValues(`questions.${questionIndex}.options`);
      if (!currentOptions || currentOptions.length === 0) {
        form.setValue(`questions.${questionIndex}.options`, [{ title: '' }]);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-6 overflow-x-hidden">
      <div className="w-full max-w-3xl px-2">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Create New Poll</h1>
          <Button variant="outline" onClick={() => navigate('/polls')}>
            Cancel
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
            <Card className="w-full">
              <CardHeader className="px-4 py-3">
                <CardTitle>Poll Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
                                form.setValue('startAt', range.from);
                              }
                              if (range?.to) {
                                form.setValue('endAt', range.to);
                              }
                            }}
                            numberOfMonths={2}
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
                          onClick={() => remove(questionIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <FormField
                      control={form.control}
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
                      control={form.control}
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

                    {form.watch(`questions.${questionIndex}.type`) !== 'text' && (
                      <div className="space-y-2">
                        <FormLabel>Options</FormLabel>
                        {form.watch(`questions.${questionIndex}.options`)?.map(
                          (_, optionIndex) => (
                            <div key={optionIndex} className="flex gap-2">
                              <FormField
                                control={form.control}
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
                              {(form.watch(`questions.${questionIndex}.options`) || []).length >
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
                disabled={createPollMutation.isPending}
              >
                {createPollMutation.isPending ? 'Creating...' : 'Create Poll'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
} 