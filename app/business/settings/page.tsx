"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building, Key, Mail } from "lucide-react"

export default function BusinessSettings() {
  const { data: session } = useSession()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="mt-2 text-gray-600">Manage your business account information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <CardTitle>Business Information</CardTitle>
            </div>
            <CardDescription>Update your business details and contact information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input id="businessName" defaultValue={session?.user?.businessName || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue={session?.user?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" defaultValue={session?.user?.firstName || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" defaultValue={session?.user?.lastName || ""} disabled />
            </div>
            <Button className="w-full" disabled>
              <Building className="h-4 w-4 mr-2" />
              Update Business Info
              <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Coming Soon</span>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-red-600" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Manage your password and security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" disabled />
            </div>
            <Button className="w-full" variant="outline" disabled>
              <Key className="h-4 w-4 mr-2" />
              Change Password
              <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Coming Soon</span>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-green-600" />
              <CardTitle>Contact Support</CardTitle>
            </div>
            <CardDescription>Get help with your Raffily business account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Support Email</Label>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="font-mono text-sm">info@rewardlabs.co.uk</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Our support team is here to help with any questions about your raffles, integrations, or account settings.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
