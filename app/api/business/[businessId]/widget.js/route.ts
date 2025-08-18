import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { businessId: string } }) {
  try {
    const { businessId } = params

    // Validate businessId format
    if (!ObjectId.isValid(businessId)) {
      const errorWidget = `
        console.error('Raffily Widget: Invalid business ID format');
        document.getElementById('raffily-widget-${businessId}')?.innerHTML = 
          '<div style="color: red; padding: 20px;">Invalid business ID</div>';
      `
      return new NextResponse(errorWidget, {
        headers: { "Content-Type": "application/javascript" },
      })
    }

    const { db } = await connectToDatabase()

    // Get current raffle data
    const currentDate = new Date()

    const businessRaffle = await db
      .collection("businessRaffles")
      .aggregate([
        {
          $match: {
            businessId: new ObjectId(businessId),
            isActive: true,
          },
        },
        {
          $lookup: {
            from: "raffles",
            localField: "raffleId",
            foreignField: "_id",
            as: "raffle",
          },
        },
        {
          $unwind: "$raffle",
        },
        {
          $match: {
            "raffle.startDate": { $lte: currentDate },
            "raffle.endDate": { $gte: currentDate },
          },
        },
        {
          $sort: { "raffle.startDate": -1 },
        },
        {
          $limit: 1,
        },
      ])
      .toArray()

    let widgetContent = ""

    if (businessRaffle.length === 0) {
      widgetContent = `
        <div style="
          border: 2px solid #e5e7eb; 
          border-radius: 8px; 
          padding: 20px; 
          text-align: center;
          font-family: Arial, sans-serif;
          background: #f9fafb;
        ">
          <h3 style="color: #6b7280; margin: 0;">No Active Raffle</h3>
          <p style="color: #9ca3af; margin: 10px 0 0 0;">Check back soon for our next exciting raffle!</p>
        </div>
      `
    } else {
      const raffle = businessRaffle[0]
      const title = raffle.customTitle || raffle.raffle.title
      const description = raffle.customDescription || raffle.raffle.description
      const primaryColor = raffle.businessCustomizations?.primaryColor || "#3b82f6"
      const logo = raffle.businessCustomizations?.logo || ""

      widgetContent = `
        <div style="
          border: 2px solid #e5e7eb; 
          border-radius: 12px; 
          padding: 24px; 
          font-family: Arial, sans-serif;
          background: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          max-width: 400px;
        ">
          ${logo ? `<img src="${logo}" alt="Logo" style="height: 40px; margin-bottom: 16px;">` : ""}
          <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 20px;">${title}</h3>
          <p style="color: #6b7280; margin: 0 0 20px 0; line-height: 1.5;">${description}</p>
          <button 
            onclick="window.open('/r/${businessId}/${raffle.raffleId}', '_blank')"
            style="
              background: ${primaryColor};
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              width: 100%;
              transition: all 0.2s;
            "
            onmouseover="this.style.opacity='0.9'"
            onmouseout="this.style.opacity='1'"
          >
            Enter Raffle
          </button>
        </div>
      `
    }

    const widgetScript = `
      (function() {
        // Find widget container
        const container = document.getElementById('raffily-widget-${businessId}') || 
                         document.querySelector('[data-raffily-business="${businessId}"]');
        
        if (container) {
          container.innerHTML = \`${widgetContent.replace(/`/g, "\\`")}\`;
        } else {
          console.error('Raffily Widget: Container not found. Add <div id="raffily-widget-${businessId}"></div> to your page.');
        }
      })();
    `

    return new NextResponse(widgetScript, {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
    })
  } catch (error) {
    console.error("Error generating widget:", error)
    const errorWidget = `
      console.error('Raffily Widget: Failed to load');
      document.getElementById('raffily-widget-${businessId}')?.innerHTML = 
        '<div style="color: red; padding: 20px;">Failed to load raffle widget</div>';
    `
    return new NextResponse(errorWidget, {
      headers: { "Content-Type": "application/javascript" },
    })
  }
}
