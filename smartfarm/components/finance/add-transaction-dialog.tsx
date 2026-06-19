'use client';

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";

const transactionFormSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Amount must be greater than 0"),
  category_id: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  payment_method: z.enum(["cash", "mobile_money", "bank_transfer", "other"]),
  status: z.enum(["paid", "pending", "overdue"]),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface AddTransactionDialogProps {
  categories: { id: string; name: string; type: 'income' | 'expense' }[];
  onAddTransaction: (values: any) => Promise<boolean>;
}

export function AddTransactionDialog({ categories, onAddTransaction }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      category_id: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      payment_method: "cash",
      status: "paid"
    }
  });

  const selectedType = watch("type");

  // Reset category if type changes
  useEffect(() => {
    setValue("category_id", "");
    setErrorMsg("");
  }, [selectedType, setValue, open]);

  // Filter categories by selected type
  const filteredCategories = categories.filter(c => c.type === selectedType);

  const onSubmit = async (data: TransactionFormValues) => {
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      const success = await onAddTransaction(data);
      if (success) {
        setOpen(false);
        reset({
          type: "expense",
          amount: 0,
          category_id: "",
          description: "",
          date: new Date().toISOString().split('T')[0],
          payment_method: "cash",
          status: "paid"
        });
      } else {
        setErrorMsg("Failed to save transaction. Please make sure your account is fully set up.");
      }
    } catch (error) {
      console.error("Failed to submit transaction:", error);
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm text-sm font-bold px-5 py-2.5 flex items-center gap-2 cursor-pointer shadow-emerald-500/20">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">New Transaction Record</DialogTitle>
        </DialogHeader>
        
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm p-3 rounded-lg mt-2 font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Transaction Type */}
            <div className="space-y-1.5">
              <Label htmlFor="type" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Transaction Type</Label>
              <Select 
                defaultValue="expense" 
                onValueChange={(val) => setValue("type", val as 'income' | 'expense')}
              >
                <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Date</Label>
              <Input 
                type="date" 
                id="date" 
                {...register("date")} 
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
              />
              {errors.date && <p className="text-[10px] font-medium text-rose-500">{errors.date.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Amount (FCFA)</Label>
              <Input 
                type="number" 
                id="amount" 
                placeholder="e.g. 50000"
                {...register("amount", { valueAsNumber: true })} 
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-950 dark:text-zinc-50"
              />
              {errors.amount && <p className="text-[10px] font-medium text-rose-500">{errors.amount.message}</p>}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Category</Label>
              <Select 
                value={watch("category_id")}
                onValueChange={(val) => setValue("category_id", val)}
              >
                <SelectTrigger className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                  {filteredCategories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && <p className="text-[10px] font-medium text-rose-500">{errors.category_id.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Payment Method */}
            <div className="space-y-1.5">
              <Label htmlFor="payment_method" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Payment Mode</Label>
              <Select 
                defaultValue="cash"
                onValueChange={(val) => setValue("payment_method", val as any)}
              >
                <SelectTrigger className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money (MTN/Orange)</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Status</Label>
              <Select 
                defaultValue="paid"
                onValueChange={(val) => setValue("status", val as any)}
              >
                <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Description / Memo</Label>
            <Input 
              type="text" 
              id="description" 
              placeholder="Provide a brief explanation..."
              {...register("description")} 
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
            />
          </div>

          <DialogFooter className="pt-4 flex gap-2 sm:justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-zinc-200 dark:border-zinc-800 text-xs font-semibold rounded-xl px-4 py-2 cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm text-sm font-bold px-5 py-2.5 flex items-center gap-2 cursor-pointer shadow-emerald-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Record"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
