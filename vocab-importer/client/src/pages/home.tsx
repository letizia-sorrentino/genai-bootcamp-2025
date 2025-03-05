import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { generateVocabulary } from "@/lib/vocabulary";
import { grammarCategorySchema, type GrammarCategory } from "@shared/schema";

export default function Home() {
  const [generatedJson, setGeneratedJson] = useState("");
  const { toast } = useToast();

  const form = useForm<GrammarCategory>({
    resolver: zodResolver(grammarCategorySchema),
    defaultValues: {
      category: "nouns",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: GrammarCategory) => generateVocabulary(data.category),
    onSuccess: (data) => {
      const formatted = JSON.stringify(data, null, 2);
      setGeneratedJson(formatted);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate vocabulary",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedJson);
      toast({
        title: "Success",
        description: "Copied to clipboard!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Vocabulary Importer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grammar Category</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a grammar category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nouns">Nouns</SelectItem>
                            <SelectItem value="verbs">Verbs</SelectItem>
                            <SelectItem value="adjectives">Adjectives</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Vocabulary"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {generatedJson && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Generated Vocabulary</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
              >
                Copy to Clipboard
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea
                value={generatedJson}
                readOnly
                className="font-mono h-[400px]"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}