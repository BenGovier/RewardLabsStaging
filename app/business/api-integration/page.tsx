"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, Play, Code, Globe, BookOpen, Zap, Database, Settings } from "lucide-react"
import { toast } from "sonner"

export default function APIIntegrationPage() {
  const { data: session } = useSession()
  const [businessId, setBusinessId] = useState<string>("")
  const [allRaffles, setAllRaffles] = useState<any[]>([])
  const [currentRaffle, setCurrentRaffle] = useState<any>(null)
  const [testResult, setTestResult] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  // Test form data
  const [testData, setTestData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    agreedToTerms: true,
  })

  useEffect(() => {
    if (session?.user?.id) {
      setBusinessId(session.user.id)
      fetchAllRaffles()
      fetchCurrentRaffle()
    }
  }, [session])

  const fetchAllRaffles = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/business/${session.user.id}/raffles`)
      if (response.ok) {
        const data = await response.json()
        setAllRaffles(data.raffles || [])
      }
    } catch (error) {
      console.error("Error fetching all raffles:", error)
    }
  }

  const fetchCurrentRaffle = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/business/${session.user.id}/current-raffle`)
      if (response.ok) {
        const data = await response.json()
        setCurrentRaffle(data)
      }
    } catch (error) {
      console.error("Error fetching current raffle:", error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  const testAPI = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/business/${businessId}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      })

      const result = await response.json()
      setTestResult(JSON.stringify(result, null, 2))

      if (response.ok) {
        toast.success("Test entry submitted successfully!")
      } else {
        toast.error("Test failed: " + result.error)
      }
    } catch (error) {
      setTestResult("Error: " + error)
      toast.error("Test failed")
    }
    setIsLoading(false)
  }

  const apiEndpoints = [
    {
      method: "GET",
      endpoint: `/api/business/${businessId}/raffles`,
      description: "Get ALL active raffles for your business",
      icon: <Database className="h-4 w-4" />,
    },
    {
      method: "GET",
      endpoint: `/api/business/${businessId}/current-raffle`,
      description: "Get the primary/latest active raffle",
      icon: <Zap className="h-4 w-4" />,
    },
    {
      method: "POST",
      endpoint: `/api/business/${businessId}/entries`,
      description: "Submit entry to current raffle",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      method: "GET",
      endpoint: `/api/business/${businessId}/widget.js`,
      description: "Get embeddable widget JavaScript",
      icon: <Globe className="h-4 w-4" />,
    },
  ]

  const integrationGuide = [
    {
      step: 1,
      title: "Get Your Business ID",
      description: "Use your unique Business ID in all API calls. This never changes.",
      code: `const BUSINESS_ID = "${businessId}";`,
    },
    {
      step: 2,
      title: "Fetch Available Raffles",
      description: "Get all active raffles available for your business integration.",
      code: `// Get all active raffles
const response = await fetch('/api/business/\${BUSINESS_ID}/raffles');
const data = await response.json();
console.log('Available raffles:', data.raffles);`,
    },
    {
      step: 3,
      title: "Display Raffle Information",
      description: "Use the raffle data to display prizes, dates, and entry forms.",
      code: `// Display raffle information
data.raffles.forEach(raffle => {
  console.log('Title:', raffle.title);
  console.log('Description:', raffle.description);
  console.log('End Date:', raffle.endDate);
  console.log('Prize Images:', raffle.images);
});`,
    },
    {
      step: 4,
      title: "Submit Entries",
      description: "Submit user entries to any active raffle without specifying raffle ID.",
      code: `// Submit entry
const entryData = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  agreedToTerms: true,
  answers: {} // Custom question answers
};

const response = await fetch('/api/business/\${BUSINESS_ID}/entries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(entryData)
});`,
    },
    {
      step: 5,
      title: "Handle Responses",
      description: "Process API responses and handle errors appropriately.",
      code: `// Handle response
if (response.ok) {
  const result = await response.json();
  console.log('Entry submitted:', result.message);
} else {
  const error = await response.json();
  console.error('Error:', error.message);
}`,
    },
  ]

  const useCases = [
    {
      title: "Website Integration",
      description: "Display current raffles on your website homepage",
      example: "Fetch raffles → Display prize images → Show countdown timer → Collect entries",
    },
    {
      title: "Email Marketing",
      description: "Include raffle information in your email campaigns",
      example: "Get raffle data → Generate email content → Include entry links → Track conversions",
    },
    {
      title: "Mobile App",
      description: "Integrate raffles into your mobile application",
      example: "API calls → Native UI display → In-app entry forms → Push notifications",
    },
    {
      title: "CRM Integration",
      description: "Sync raffle entries with your customer database",
      example: "Collect entries → Validate data → Sync to CRM → Track customer engagement",
    },
  ]

  const fieldGuide = [
    { field: "raffleId", type: "string", description: "Unique identifier for the raffle" },
    { field: "title", type: "string", description: "Raffle title (customizable by business)" },
    { field: "description", type: "string", description: "Raffle description (customizable by business)" },
    { field: "startDate", type: "ISO date", description: "When the raffle starts accepting entries" },
    { field: "endDate", type: "ISO date", description: "When the raffle stops accepting entries" },
    { field: "images", type: "array", description: "Array of prize image URLs" },
    { field: "coverImage", type: "string", description: "Main cover image URL" },
    { field: "customizations", type: "object", description: "Business-specific customizations (logo, colors, etc.)" },
    { field: "entryUrl", type: "string", description: "API endpoint for submitting entries" },
    { field: "publicUrl", type: "string", description: "Public raffle page URL" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">API Integration Guide</h1>
        <p className="text-muted-foreground">
          Complete developer guide for integrating Raffily into your website or application
        </p>
      </div>

      {/* Business ID Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Your Business ID
          </CardTitle>
          <CardDescription>
            Use this ID in all API calls. This never changes, even when new raffles are added.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input value={businessId} readOnly className="font-mono" />
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(businessId)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Raffles Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Active Raffles ({allRaffles.length})</CardTitle>
          <CardDescription>All raffles currently available for API integration</CardDescription>
        </CardHeader>
        <CardContent>
          {allRaffles.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allRaffles.map((raffle, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default">Active</Badge>
                    <span className="font-medium">{raffle.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{raffle.description}</p>
                  <p className="text-xs text-muted-foreground">Ends: {new Date(raffle.endDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <Badge variant="secondary">No Active Raffles</Badge>
          )}
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>
            These endpoints never change - integrate once and automatically get new raffles!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiEndpoints.map((endpoint, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {endpoint.icon}
                  <Badge variant={endpoint.method === "GET" ? "default" : "secondary"}>{endpoint.method}</Badge>
                  <code className="text-sm bg-muted px-2 py-1 rounded flex-1">{endpoint.endpoint}</code>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(endpoint.endpoint)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{endpoint.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Step-by-Step Integration Guide
          </CardTitle>
          <CardDescription>Follow these steps to integrate Raffily into your application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {integrationGuide.map((step, index) => (
              <div key={index} className="border-l-2 border-primary pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Step {step.step}</Badge>
                  <h3 className="font-semibold">{step.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                <div className="bg-muted p-3 rounded-md">
                  <code className="text-xs">{step.code}</code>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Field Reference */}
      <Card>
        <CardHeader>
          <CardTitle>API Response Fields</CardTitle>
          <CardDescription>Understanding the data structure returned by the API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fieldGuide.map((field, index) => (
              <div key={index} className="flex items-start gap-4 p-3 border rounded-lg">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded min-w-fit">{field.field}</code>
                <Badge variant="outline" className="min-w-fit">
                  {field.type}
                </Badge>
                <p className="text-sm text-muted-foreground">{field.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Use Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Common Integration Use Cases</CardTitle>
          <CardDescription>How businesses typically use the Raffily API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {useCases.map((useCase, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">{useCase.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{useCase.description}</p>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-xs">{useCase.example}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Test API Integration
          </CardTitle>
          <CardDescription>Test your API integration with sample data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={testData.firstName}
                  onChange={(e) => setTestData({ ...testData, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={testData.lastName}
                  onChange={(e) => setTestData({ ...testData, lastName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={testData.email}
                onChange={(e) => setTestData({ ...testData, email: e.target.value })}
              />
            </div>
            <Button onClick={testAPI} disabled={isLoading || allRaffles.length === 0} className="w-full">
              {isLoading ? "Testing..." : "Test Entry Submission"}
            </Button>
            {testResult && (
              <div>
                <Label>Test Result:</Label>
                <Textarea value={testResult} readOnly className="font-mono text-xs h-32 mt-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Widget Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Widget Integration (No-Code Solution)
          </CardTitle>
          <CardDescription>Embed raffles directly into your website with one line of code</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <code className="text-sm">
                {`<!-- Add this to your website -->\n<div id="raffily-widget-${businessId}"></div>\n<script src="${typeof window !== "undefined" ? window.location.origin : ""}/api/business/${businessId}/widget.js"></script>`}
              </code>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                copyToClipboard(
                  `<div id="raffily-widget-${businessId}"></div>\n<script src="${typeof window !== "undefined" ? window.location.origin : ""}/api/business/${businessId}/widget.js"></script>`,
                )
              }
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Widget Code
            </Button>
            <div className="text-sm text-muted-foreground">
              The widget automatically updates when admin creates new raffles each month. No code changes required!
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle>Developer Support</CardTitle>
          <CardDescription>Need help with your integration?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Complete API Documentation
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ExternalLink className="h-4 w-4 mr-2" />
              Download Integration Examples
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ExternalLink className="h-4 w-4 mr-2" />
              Contact Developer Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
