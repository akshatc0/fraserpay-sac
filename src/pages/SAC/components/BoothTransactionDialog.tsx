
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { processPurchase } from '@/contexts/transactions/transactionService';
import { CartItem, Product } from '@/types';

interface BoothTransactionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  booths: any[];
  getBoothById: (boothId: string) => any;
}

interface Student {
  id: string;
  name: string;
  studentNumber: string;
  email: string;
  balance: number;
}

const BoothTransactionDialog: React.FC<BoothTransactionDialogProps> = ({
  isOpen = false,
  onOpenChange = () => {},
  booths = [],
  getBoothById = () => undefined
}) => {
  const [selectedBooth, setSelectedBooth] = useState<string | undefined>(undefined);
  const [studentNumber, setStudentNumber] = useState('');
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [cart, setCart] = useState<{product: Product; quantity: number}[]>([]);
  const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);
  const [isStudentLoading, setIsStudentLoading] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;
  const userName = user?.name;

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setSelectedBooth(undefined);
    setStudentNumber('');
    setFoundStudent(null);
    setCart([]);
    setIsProcessingTransaction(false);
    setIsStudentLoading(false);
  };

  const handleBoothChange = (value: string) => {
    setSelectedBooth(value);
  };

  const findStudentByNumber = async () => {
    setIsStudentLoading(true);
    setFoundStudent(null);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('student_number', studentNumber)
        .single();
      
      if (error) {
        console.error('Error finding student:', error);
        toast.error('Student not found');
        return;
      }
      
      if (data) {
        setFoundStudent({
          id: data.id,
          name: data.name,
          studentNumber: data.student_number,
          email: data.email,
          balance: data.tickets / 100 // Fix for issue #2 - convert to dollars
        });
      } else {
        toast.error('Student not found');
      }
    } catch (error) {
      console.error('Error finding student:', error);
      toast.error('Failed to find student');
    } finally {
      setIsStudentLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    const existingCartItem = cart.find(item => item.product.id === product.id);
    
    if (existingCartItem) {
      const updatedCart = cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    const updatedCart = cart.filter(item => item.product.id !== productId);
    setCart(updatedCart);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handleProcessTransaction = async () => {
    if (!foundStudent) {
      toast.error('Please find a student first');
      return;
    }
    
    if (!selectedBooth) {
      toast.error('Please select a booth');
      return;
    }
    
    const booth = getBoothById(selectedBooth);
    if (!booth) {
      toast.error('Selected booth not found');
      return;
    }
    
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    
    setIsProcessingTransaction(true);
    
    try {
      // Convert our cart format to the expected CartItem format with productId property
      const cartItems: CartItem[] = cart.map(item => ({
        productId: item.product.id,
        product: item.product,
        quantity: item.quantity
      }));
      
      const result = await processPurchase(
        booth.id,
        foundStudent.id,
        foundStudent.name,
        userId || '',
        userName || '',
        cartItems,
        booth.name
      );
      
      if (result.success) {
        const { data: updatedUser, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', foundStudent.id)
          .single();
          
        if (!error && updatedUser) {
          setFoundStudent({
            ...foundStudent,
            balance: updatedUser.tickets / 100 // Fix for issue #2 - convert to dollars
          });
        }
        
        toast.success('Transaction processed successfully!');
        
        // Reset cart after successful transaction
        setCart([]);
      } else {
        toast.error('Failed to process transaction');
      }
    } catch (error) {
      console.error('Error processing transaction:', error);
      toast.error('Failed to process transaction: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessingTransaction(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Process Booth Transaction</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Left Side: Booth and Student Selection */}
          <div>
            <Card>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="booth">Select Booth</Label>
                  <Select onValueChange={handleBoothChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a booth" />
                    </SelectTrigger>
                    <SelectContent>
                      {booths.map((booth) => (
                        <SelectItem key={booth.id} value={booth.id}>
                          {booth.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="studentNumber">Student Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="studentNumber"
                      placeholder="Enter student number"
                      value={studentNumber}
                      onChange={(e) => setStudentNumber(e.target.value)}
                    />
                    <Button type="button" onClick={findStudentByNumber} disabled={isStudentLoading}>
                      {isStudentLoading ? 'Loading...' : 'Find Student'}
                    </Button>
                  </div>
                </div>

                {foundStudent && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold">Student Details</h3>
                    <p>Name: {foundStudent.name}</p>
                    <p>Student Number: {foundStudent.studentNumber}</p>
                    <p>Balance: ${foundStudent.balance.toFixed(2)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side: Cart and Transaction Details */}
          <div>
            <Card>
              <CardContent className="space-y-4">
                <h2 className="text-lg font-semibold">Cart</h2>
                {cart.length === 0 ? (
                  <p>Cart is empty</p>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between">
                        <span>{item.product.name} x {item.quantity}</span>
                        <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveFromCart(item.product.id)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex items-center justify-between font-semibold">
                      <span>Total:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <Separator />

                {selectedBooth && foundStudent && (
                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleProcessTransaction}
                    disabled={isProcessingTransaction || cart.length === 0}
                  >
                    {isProcessingTransaction ? 'Processing...' : 'Process Transaction'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {selectedBooth && getBoothById && getBoothById(selectedBooth) && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Products at this Booth</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {getBoothById(selectedBooth)?.products?.map((product) => (
                    <div key={product.id} className="border rounded-md p-2">
                      <p className="font-semibold">{product.name}</p>
                      <p>${product.price.toFixed(2)}</p>
                      <Button type="button" size="sm" onClick={() => handleAddToCart(product)}>
                        Add to Cart
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BoothTransactionDialog;
