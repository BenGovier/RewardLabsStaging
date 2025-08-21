"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Palette, Settings } from "lucide-react"

export default function CustomizeRaffle() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customize Raffle</h1>
        <p className="mt-2 text-gray-600">
          Create and customize your raffle competitions with branding, prizes, and entry requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-blue-600" />
              <CardTitle>Branding & Design</CardTitle>
            </div>
            <CardDescription>Customize colors, logos, and overall appearance of your raffle page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Available Options:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Custom brand colors</li>
                <li>• Logo upload</li>
                <li>• Background images</li>
                <li>• Font selection</li>
              </ul>
            </div>
            <Button className="w-full" disabled>
              <Palette className="h-4 w-4 mr-2" />
              Customize Branding
              <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Coming Soon</span>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-green-600" />
              <CardTitle>Prize Configuration</CardTitle>
            </div>
            <CardDescription>Set up prizes, entry requirements, and competition rules.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Configuration Options:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Prize descriptions</li>
                <li>• Entry requirements</li>
                <li>• Competition duration</li>
                <li>• Terms and conditions</li>
              </ul>
            </div>
            <Button className="w-full" variant="outline" disabled>
              <Settings className="h-4 w-4 mr-2" />
              Configure Prizes
              <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Coming Soon</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
