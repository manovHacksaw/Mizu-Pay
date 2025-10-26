'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'
import { Upload, Plus, Save, AlertCircle, CheckCircle } from 'lucide-react'

interface GiftCardFormData {
  name: string
  amount: number
  currency: string
  provider: string
  code: string
  pin: string
  description: string
}

export default function AdminPage() {
  const [formData, setFormData] = useState<GiftCardFormData>({
    name: '',
    amount: 0,
    currency: 'USD',
    provider: '',
    code: '',
    pin: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleInputChange = (field: keyof GiftCardFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setMessage('')

    try {
      const response = await fetch('/api/gift-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setMessage('Gift card added successfully!')
        // Reset form
        setFormData({
          name: '',
          amount: 0,
          currency: 'USD',
          provider: '',
          code: '',
          pin: '',
          description: ''
        })
      } else {
        setSubmitStatus('error')
        setMessage('Failed to add gift card. Please try again.')
      }
    } catch (error) {
      setSubmitStatus('error')
      setMessage('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 [background:radial-gradient(120%_80%_at_50%_50%,_transparent_40%,_black_100%)]" />
      </div>

      {/* Header */}
      <motion.div 
        className="flex justify-center w-full py-6 px-4 fixed top-0 left-0 right-0 z-40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between px-6 py-3 rounded-full w-full max-w-7xl relative z-10">
          <div className="flex items-center">
            {/* <h1 className="text-2xl font-bold text-white">Admin Panel</h1> */}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12">
          <h1 className="text-[clamp(2.25rem,6vw,4rem)] font-extralight leading-[0.95] tracking-tight text-white mb-4">
            Gift Card Management
          </h1>
          <p className="text-lg tracking-tight text-blue-400 md:text-xl max-w-2xl mx-auto">
            Upload and manage gift cards for the Mizu Pay platform.
          </p>
        </div>

        {/* Gift Card Upload Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-blue-500/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Upload className="w-6 h-6 text-blue-400" />
                Add New Gift Card
              </CardTitle>
              <CardDescription className="text-blue-400">
                Fill in the details to add a new gift card to the inventory.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gift Card Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white font-medium">
                      Gift Card Name *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="e.g., Amazon Gift Card"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="bg-white/10 border-blue-500/20 text-white placeholder-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/40"
                      required
                    />
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-white font-medium">
                      Amount *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="100"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                      className="bg-white/10 border-blue-500/20 text-white placeholder-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/40"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Currency */}
                  <div className="space-y-2">
                    <Label htmlFor="currency" className="text-white font-medium">
                      Currency *
                    </Label>
                    <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                      <SelectTrigger className="bg-white/10 border-blue-500/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Provider */}
                  <div className="space-y-2">
                    <Label htmlFor="provider" className="text-white font-medium">
                      Provider *
                    </Label>
                    <Input
                      id="provider"
                      type="text"
                      placeholder="e.g., Amazon, Flipkart, Myntra"
                      value={formData.provider}
                      onChange={(e) => handleInputChange('provider', e.target.value)}
                      className="bg-white/10 border-blue-500/20 text-white placeholder-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/40"
                      required
                    />
                  </div>

                  {/* Gift Card Code */}
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-white font-medium">
                      Gift Card Code *
                    </Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="e.g., ABC123XYZ789"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      className="bg-white/10 border-blue-500/20 text-white placeholder-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/40"
                      required
                    />
                  </div>

                  {/* PIN */}
                  <div className="space-y-2">
                    <Label htmlFor="pin" className="text-white font-medium">
                      PIN (Optional)
                    </Label>
                    <Input
                      id="pin"
                      type="text"
                      placeholder="e.g., 1234"
                      value={formData.pin}
                      onChange={(e) => handleInputChange('pin', e.target.value)}
                      className="bg-white/10 border-blue-500/20 text-white placeholder-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/40"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Optional description for this gift card..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="bg-white/10 border-blue-500/20 text-white placeholder-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/40 min-h-[100px]"
                  />
                </div>

                {/* Status Message */}
                {message && (
                  <div className={`flex items-center gap-2 p-4 rounded-lg ${
                    submitStatus === 'success' 
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}>
                    {submitStatus === 'success' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <span>{message}</span>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative overflow-hidden border border-blue-500/30 bg-gradient-to-r from-blue-500/20 to-blue-600/10 px-6 py-3 text-sm rounded-lg font-medium tracking-wide text-white backdrop-blur-sm transition-[border-color,background-color,box-shadow] duration-500 hover:border-blue-400/50 hover:bg-blue-500/30 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Add Gift Card
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Add Section */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-blue-500/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                Quick Add Templates
              </CardTitle>
              <CardDescription className="text-blue-400">
                Use these templates to quickly add common gift cards.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Amazon Gift Card', provider: 'Amazon', currency: 'USD', amount: 50 },
                  { name: 'Flipkart Gift Card', provider: 'Flipkart', currency: 'INR', amount: 1000 },
                  { name: 'Myntra Gift Card', provider: 'Myntra', currency: 'INR', amount: 500 },
                  { name: 'Apple Gift Card', provider: 'Apple', currency: 'USD', amount: 25 },
                  { name: 'Google Play Gift Card', provider: 'Google Play', currency: 'USD', amount: 10 },
                  { name: 'Netflix Gift Card', provider: 'Netflix', currency: 'USD', amount: 15 }
                ].map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        name: template.name,
                        provider: template.provider,
                        currency: template.currency,
                        amount: template.amount
                      }))
                    }}
                    className="bg-white/5 border-blue-500/20 text-white hover:bg-blue-500/10 hover:border-blue-400/40 transition-all duration-300"
                  >
                    {template.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
