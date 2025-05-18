
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create embeddings for text using OpenAI
async function createEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }
    
    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error("Error creating embedding:", error);
    throw error;
  }
}

// Logistics domain knowledge
const logisticsKnowledge = [
  {
    name: "Crane Worldwide Logistics - Company Profile",
    description: "General information about Crane Worldwide Logistics",
    source_type: "company_info",
    content: `Crane Worldwide Logistics is a full-service air, ocean, customs brokerage, and logistics company committed to providing innovative supply chain solutions. Founded in 2008, the company has grown to over 120 locations across 30 countries. Crane Worldwide Logistics specializes in delivering high-touch, personalized logistics services with a focus on solving complex supply chain challenges through technology and expertise.

The company's mission is to be the premier global provider of customized logistics solutions with an unwavering commitment to compliance, safety, and security. They prioritize building strong relationships with clients to understand their unique business needs and design tailored solutions.

Crane Worldwide serves diverse industry verticals including aerospace, automotive, energy, government services, healthcare, industrial, retail, and technology. Their comprehensive service offerings include air freight, ocean freight, customs brokerage, warehouse management, supply chain consulting, trade compliance, project logistics, and specialized services like temperature-controlled shipping and hazardous materials handling.

The company's proprietary technology platform, C-View, provides real-time visibility, business intelligence, and data analytics to optimize supply chain performance. Crane Worldwide is also committed to sustainability initiatives and reducing environmental impact through carbon footprint reduction strategies and compliance with environmental regulations.`
  },
  {
    name: "Freight Forwarding Services",
    description: "Information about Crane's freight forwarding services",
    source_type: "services",
    content: `Crane Worldwide Logistics offers comprehensive freight forwarding services, managing the movement of goods across international borders efficiently and cost-effectively. 

Air Freight: The company provides expedited air freight solutions with scheduled and charter options, including next flight out service, consolidated shipments, and specialized aircraft charters. They handle dangerous goods, temperature-sensitive cargo, and oversized shipments with full compliance with international regulations.

Ocean Freight: Services include Full Container Load (FCL), Less than Container Load (LCL), and specialized Break-Bulk and Roll-on/Roll-off (RO/RO) shipping. Crane manages the entire process from port to port or door to door with competitive rates negotiated with major ocean carriers.

Road Transport: Offers comprehensive ground transportation services including FTL (Full Truckload), LTL (Less than Truckload), and specialized equipment for oversized cargo. Their carrier network ensures reliable service across North America, Europe, and other regions.

Rail Freight: Provides intermodal solutions combining rail with other transportation modes for cost-effective and environmentally friendly shipping options.

The company's freight forwarding services feature real-time tracking through their C-View platform, customs documentation preparation, cargo insurance, specialized packaging solutions, and route optimization to balance cost, speed, and reliability based on client priorities.`
  },
  {
    name: "Customs Brokerage Services",
    description: "Information about Crane's customs brokerage services",
    source_type: "services",
    content: `Crane Worldwide Logistics offers expert customs brokerage services designed to navigate complex international customs regulations while ensuring efficient clearance of goods. Their team of licensed customs brokers maintains up-to-date knowledge of constantly changing import/export regulations across global markets.

Key customs brokerage services include:

1. Import/Export Documentation: Preparation and submission of all required customs documentation including commercial invoices, certificates of origin, import licenses, and other specialized documents.

2. Customs Clearance: Facilitation of smooth customs clearance processes through electronic filing systems and established relationships with customs authorities.

3. Tariff Classification: Expert determination of proper Harmonized System (HS) codes to ensure accurate duty payments and compliance.

4. Duty and Tax Calculations: Precise calculation of duties, taxes, and fees with identification of potential exemptions or reductions.

5. Free Trade Agreement (FTA) Qualification: Evaluation of shipments for eligibility under various free trade agreements to minimize duties.

6. Binding Rulings: Obtaining binding rulings from customs authorities for clarity on classification, valuation, or origin determinations.

7. Post-Entry Amendments: Management of post-entry corrections and adjustments when necessary.

8. Compliance Programs: Development and implementation of customs compliance programs tailored to client needs.

9. Training and Education: Provision of customs compliance training for clients' staff.

10. Audit Support: Assistance during customs audits with comprehensive documentation and expert representation.

Crane's customs brokerage services are fully integrated with their freight forwarding and logistics solutions through their proprietary C-View technology platform, providing clients with a seamless end-to-end supply chain solution with complete visibility.`
  },
  {
    name: "Supply Chain Solutions",
    description: "Information about Crane's supply chain solutions",
    source_type: "services",
    content: `Crane Worldwide Logistics delivers comprehensive supply chain solutions designed to optimize operational efficiency and drive business value. Their approach combines strategic consulting, advanced technology, and flexible execution to create resilient and agile supply chains.

Core supply chain services include:

1. Supply Chain Consulting: Expert analysis of existing supply chain operations with recommendations for optimization based on industry best practices. Services include network design, strategic sourcing, inventory optimization, risk management, and technology assessment.

2. Warehouse Management: Operation of strategically located distribution centers worldwide offering storage, cross-docking, pick-and-pack, kitting, labeling, and value-added services. Facilities support specialized requirements including temperature-controlled environments, high-security areas, and hazardous materials handling.

3. Inventory Management: Implementation of sophisticated inventory control systems with cycle counting, real-time tracking, demand planning, and forecasting capabilities to minimize carrying costs while maintaining optimal inventory levels.

4. Order Fulfillment: Efficient processing of orders from receipt to delivery with options for B2B and B2C distribution, managing returns, and providing order status visibility.

5. Transportation Management: Coordination of multi-modal transportation with carrier selection, load planning, and route optimization to reduce costs and improve delivery performance.

6. Visibility Solutions: Implementation of Crane's C-View technology platform providing real-time visibility across the entire supply chain with advanced analytics and reporting.

7. Contract Logistics: Development of dedicated logistics operations tailored to specific client requirements with KPI-driven performance management.

8. Supply Chain Security: Implementation of comprehensive security protocols compliant with C-TPAT, AEO, and other international security standards.

Crane's supply chain solutions are highly adaptable and scalable, supporting businesses ranging from small enterprises to global corporations across diverse industries including retail, healthcare, technology, automotive, and energy sectors.`
  },
  {
    name: "Trade Compliance",
    description: "Information about trade compliance services",
    source_type: "services",
    content: `Crane Worldwide Logistics offers specialized trade compliance services to help companies navigate the complex landscape of international trade regulations. Their approach ensures regulatory adherence while optimizing trade processes for efficiency and cost-effectiveness.

Key trade compliance offerings include:

1. Regulatory Compliance: Comprehensive support for compliance with customs regulations, trade agreements, sanctions, and export controls across multiple jurisdictions.

2. Export Controls Management: Guidance on dual-use goods, military items, and technology transfer restrictions with classification assistance, license determination, and application support.

3. Sanctioned Party Screening: Automated screening against global restricted party lists with alert mechanisms and documented compliance processes.

4. Import Compliance Programs: Development and implementation of formal import compliance programs including standard operating procedures, training, and internal audit protocols.

5. Free Trade Agreement Utilization: Analysis of supply chains for FTA eligibility with documentation preparation and verification processes to maximize duty savings.

6. Valuation Services: Expert assistance with customs valuation methodologies, related party transactions, and assists to ensure proper declared values.

7. Country of Origin Determinations: Analysis and documentation of product origin based on applicable rules for proper marking and preferential treatment qualification.

8. Special Trade Programs: Utilization of duty drawback, foreign trade zones, bonded warehouses, and similar programs to reduce duty expenses.

9. Compliance Audits and Risk Assessments: Conduct of comprehensive compliance audits with identification of risks and development of mitigation strategies.

10. Training and Education: Delivery of customized training programs on trade compliance topics for client personnel.

Crane's trade compliance services are provided by a team of certified trade compliance professionals with backgrounds in customs, legal, and logistics disciplines. Their expertise spans multiple industries and regulatory environments, ensuring clients receive accurate, current guidance on complex compliance matters.`
  },
  {
    name: "Project Logistics",
    description: "Information about project logistics services",
    source_type: "services",
    content: `Crane Worldwide Logistics specializes in project logistics services designed for complex, oversized, and high-value shipments requiring specialized equipment and expertise. Their project logistics team manages end-to-end solutions for capital projects, infrastructure development, energy sector initiatives, and industrial equipment installations.

Key project logistics capabilities include:

1. Project Feasibility and Planning: Comprehensive assessment of project logistics requirements including route surveys, infrastructure evaluations, and permit investigations to identify potential challenges before execution.

2. Heavy Lift and Out-of-Gauge Transport: Management of oversized and overweight cargo using specialized equipment including extended flatbeds, multi-axle trailers, and heavy-lift cranes.

3. Chartering Services: Arrangement of full vessel charters, part charters, and aircraft charters tailored to project-specific requirements.

4. Engineering Solutions: Development of custom lifting, securing, and transport solutions with structural analysis and technical drawings by qualified engineers.

5. Project Cargo Insurance: Arrangement of comprehensive project cargo insurance coverage with risk assessment and mitigation planning.

6. Site Management: On-site logistics coordination including equipment positioning, staging area management, and coordination with construction or installation teams.

7. Documentation and Compliance: Expert handling of permits, authorizations, and customs documentation for project cargo across multiple jurisdictions.

8. Safety and Quality Control: Implementation of rigorous safety protocols and quality assurance processes throughout project execution.

9. Real-time Project Visibility: Utilization of C-View technology platform for real-time tracking and status reporting of all project components.

10. Emergency Response: Development and implementation of contingency plans with 24/7 support capabilities for critical projects.

Crane's project logistics services are delivered by specialized teams with extensive experience in sectors including oil and gas, power generation, renewable energy, mining, construction, and manufacturing. Their global network enables seamless project execution across international boundaries with consistent processes and communication.`
  },
  {
    name: "Industry Solutions - Healthcare",
    description: "Healthcare logistics solutions",
    source_type: "industry",
    content: `Crane Worldwide Logistics provides specialized healthcare logistics solutions designed to meet the stringent requirements of pharmaceuticals, medical devices, biotechnology products, and clinical trials materials. Their healthcare logistics services prioritize product integrity, regulatory compliance, and patient safety throughout the supply chain.

Key healthcare logistics capabilities include:

1. Temperature-Controlled Transport: Management of cold chain logistics with precise temperature control for refrigerated (2-8°C), frozen (-20°C), and deep-frozen (-80°C) products using validated shipping containers, refrigerated vehicles, and temperature monitoring devices.

2. cGMP/GDP Compliant Warehousing: Operation of healthcare-dedicated warehouse facilities compliant with Current Good Manufacturing Practice (cGMP) and Good Distribution Practice (GDP) standards, featuring temperature-mapped storage zones, restricted access, and specialized handling protocols.

3. Pharmaceutical Compliance: Adherence to global pharmaceutical regulations including FDA, EMA, and WHO guidelines with documented standard operating procedures and extensive training for personnel handling healthcare products.

4. Clinical Trial Logistics: Support for global clinical trials with services including investigational product distribution, biological sample transport, and returns management with complete chain of custody documentation.

5. Medical Device Distribution: Specialized handling of sensitive medical equipment with calibration maintenance, sterile packaging preservation, and just-in-time delivery to healthcare facilities.

6. Healthcare Packaging Solutions: Provision of validated packaging systems for temperature-sensitive products with qualification testing and performance verification.

7. Healthcare Quality Management: Implementation of dedicated quality management systems with thorough documentation, validation protocols, and continuous monitoring processes.

8. Regulatory Documentation: Expert preparation and management of healthcare-specific documentation including certificates of analysis, temperature records, and compliance declarations.

9. Healthcare Technology Solutions: Implementation of systems providing complete visibility, product serialization tracking, and electronic regulatory documentation management.

10. Emergency Logistics: Provision of urgent shipping solutions for life-critical products with 24/7 support and expedited customs clearance capabilities.

Crane's healthcare logistics teams include specialists with extensive experience in pharmaceutical and medical device supply chains. Their solutions are designed to ensure product efficacy, regulatory compliance, and ultimately patient safety throughout the distribution process.`
  },
  {
    name: "Industry Solutions - Energy",
    description: "Energy sector logistics solutions",
    source_type: "industry",
    content: `Crane Worldwide Logistics delivers specialized energy sector logistics solutions supporting upstream, midstream, and downstream operations as well as renewable energy projects. Their energy logistics services address the unique challenges of this sector, including remote locations, oversized equipment, and time-critical operations.

Key energy logistics capabilities include:

1. Upstream Support: Management of logistics for exploration and production activities including rig moves, equipment positioning, and supply base operations with 24/7 emergency response capabilities for critical parts and equipment.

2. Project Logistics: Coordination of complex projects including modular construction components, heavy lift operations, and oversized cargo transportation with comprehensive project management methodologies.

3. Downstream Distribution: Facilitation of refined product distribution, chemical logistics, and retail network supply with specialized handling for hazardous materials and regulatory compliance.

4. Renewable Energy Logistics: Support for wind, solar, and other renewable energy installations including transportation of turbine components, solar panels, and specialized installation equipment to often remote locations.

5. Energy Supply Chain Optimization: Analysis and redesign of energy sector supply chains to reduce costs, improve reliability, and enhance responsiveness to market fluctuations.

6. Remote Site Logistics: Management of supply chains to offshore platforms, remote drilling sites, and isolated production facilities in challenging environments including arctic, desert, and offshore conditions.

7. Equipment Preservation: Implementation of specialized packaging and preservation techniques for sensitive energy equipment during transport and storage to prevent corrosion and damage.

8. Compliance Management: Navigation of complex regulatory requirements for energy sector cargo including hazardous materials management, environmental compliance, and international trade regulations.

9. Visibility Solutions: Deployment of C-View technology providing real-time tracking and status updates for critical energy equipment and materials across the supply chain.

10. Supplier Management: Coordination with global OEMs, service companies, and parts suppliers to optimize the flow of materials to energy operations worldwide.

Crane's energy logistics teams include industry veterans with extensive experience in oil and gas operations, power generation, and renewable energy projects. Their solutions are designed to increase operational uptime, reduce project delays, and manage the cost-intensive aspects of energy sector logistics effectively.`
  },
  {
    name: "Industry Solutions - Aerospace",
    description: "Aerospace logistics solutions",
    source_type: "industry",
    content: `Crane Worldwide Logistics provides specialized aerospace logistics solutions supporting commercial aviation, defense contractors, and space industry clients. Their aerospace logistics services address the sector's requirements for precision, security, and time-definite delivery of critical components.

Key aerospace logistics capabilities include:

1. Aircraft-on-Ground (AOG) Support: Time-critical logistics solutions for grounded aircraft with 24/7 response teams, expedited customs clearance, and chartered transportation options to minimize costly downtime.

2. Aerospace Supply Chain Management: Design and operation of aerospace-specific supply chains with specialized handling for engine components, airframe parts, and avionics with complete traceability and documentation.

3. Defense and Military Logistics: Support for defense contractors and military operations with security-cleared personnel, ITAR compliance protocols, and specialized handling for sensitive equipment and technology.

4. MRO Logistics: Coordination of component movements to and from Maintenance, Repair and Overhaul facilities with synchronized delivery schedules aligned with maintenance programs.

5. Aerospace Warehousing: Operation of aerospace-certified storage facilities with FOD (Foreign Object Debris) prevention protocols, electrostatic discharge protection, and environmental controls for sensitive components.

6. International Trade Compliance: Navigation of complex aerospace export controls including ITAR, EAR, and military/dual-use goods regulations with expert documentation and licensing support.

7. Production Logistics: Just-in-time delivery services supporting aircraft and component manufacturing operations with inventory management and production line sequencing.

8. Quality Management: Implementation of AS9120-aligned quality management processes with comprehensive documentation and audit trails meeting aerospace industry standards.

9. Aircraft Part Authentication: Verification of component authenticity and certification with secure chain of custody documentation throughout the logistics process.

10. Specialized Transport: Provision of custom packaging, handling, and transportation solutions for oversized aerospace components including wings, fuselage sections, and complete aircraft.

Crane's aerospace logistics teams include specialists with extensive experience in aviation supply chains and compliance requirements. Their solutions are designed to support both routine aerospace operations and critical situations requiring immediate response, with an emphasis on maintaining the highest levels of quality and security throughout the logistics process.`
  },
  {
    name: "Technology Solutions - C-View Platform",
    description: "Information about Crane's proprietary C-View technology platform",
    source_type: "technology",
    content: `Crane Worldwide Logistics' proprietary C-View technology platform is a comprehensive digital solution providing end-to-end supply chain visibility, business intelligence, and operational control. Designed specifically for global logistics operations, C-View integrates multiple data sources to create a single source of truth for supply chain management.

Key features of the C-View platform include:

1. Real-time Shipment Visibility: Tracking of shipments across all transportation modes with milestone updates, estimated arrival times, and exception alerts accessible via web portal and mobile applications.

2. Document Management: Digital storage and retrieval of all shipping documents including commercial invoices, packing lists, bills of lading, certificates of origin, and customs documentation.

3. Order Management: Comprehensive order tracking from placement through delivery with status updates, timeline visualization, and performance metrics.

4. Business Intelligence: Advanced analytics and customizable dashboards providing insights into supply chain performance, cost analysis, carrier metrics, and operational KPIs.

5. Global Trade Management: Support for international trade compliance including restricted party screening, product classification, duty calculation, and documentation verification.

6. Warehouse Management: Inventory visibility across multiple locations with stock level monitoring, order fulfillment tracking, and space utilization analytics.

7. Exception Management: Proactive identification of potential disruptions with automated alerts, impact analysis, and resolution tracking.

8. Integration Capabilities: API-driven architecture enabling seamless connection with client ERP systems, carrier platforms, and third-party applications.

9. Reporting Suite: Extensive library of standard reports plus custom report generation capabilities with scheduled distribution options.

10. Mobile Functionality: Native mobile applications for iOS and Android providing on-the-go access to critical supply chain information.

The C-View platform is continuously enhanced through Crane's technology development roadmap, ensuring it remains at the forefront of logistics technology. Clients receive regular updates and enhancements without service disruption, along with dedicated training and support to maximize the platform's value for their operations.

The platform's modular design allows clients to implement specific functionality based on their immediate needs while maintaining the option to expand capabilities as requirements evolve. This scalability makes C-View suitable for organizations of all sizes across diverse industry verticals.`
  },
  {
    name: "Global Trade Regulations",
    description: "Information about international trade regulations and compliance",
    source_type: "compliance",
    content: `Crane Worldwide Logistics maintains comprehensive expertise in global trade regulations to guide clients through the complex landscape of international commerce. Their knowledge encompasses customs requirements, trade agreements, sanctions programs, and industry-specific regulations across major trading nations and regional blocs.

Key areas of global trade regulatory expertise include:

1. Customs Valuation: Application of WTO valuation methodologies including transaction value, deductive value, computed value, and fallback methods with particular expertise in related party transactions and assists.

2. Classification Systems: Detailed knowledge of the Harmonized System (HS) nomenclature, including country-specific tariff schedules such as the Harmonized Tariff Schedule of the US (HTSUS), Combined Nomenclature (CN) for the EU, and similar systems worldwide.

3. Rules of Origin: Application of preferential and non-preferential origin rules under various trade agreements including USMCA, CPTPP, EU agreements, and bilateral arrangements between trading partners.

4. Free Trade Agreements: Expertise in qualification requirements, documentation procedures, and verification processes for major FTAs worldwide, enabling duty optimization and preferential market access.

5. Export Controls: Knowledge of dual-use goods regulations, military/defense export restrictions, and technology transfer controls including US EAR, ITAR, EU Dual-Use Regulation, and similar controls in other jurisdictions.

6. Sanctions Programs: Monitoring and compliance with economic sanctions administered by OFAC, UN, EU, UK, and other authorities with screening procedures and risk mitigation strategies.

7. Anti-Dumping and Countervailing Duties: Tracking of special duties imposed on specific products from particular countries with strategies for legitimate duty avoidance where applicable.

8. Special Trade Programs: Utilization of duty deferral and exemption programs including foreign trade zones, bonded warehouses, duty drawback, inward processing relief, and temporary importation provisions.

9. Supply Chain Security: Implementation of C-TPAT, AEO, and similar authorized economic operator programs with security assessments and certification support.

10. Industry-Specific Regulations: Navigation of additional requirements for regulated industries including FDA for food and pharmaceuticals, USDA for agricultural products, FCC for electronics, and similar authorities worldwide.

Crane's trade compliance professionals continuously monitor regulatory changes across global markets, providing clients with updates on developments that may impact their supply chains. They offer both strategic guidance on structural compliance approaches and tactical support for specific shipments or transactions.`
  }
];

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // First, check if we already have sources
    const { data: existingSources, error: checkError } = await supabase
      .from("context_sources")
      .select("name")
      .limit(1);
      
    if (checkError) {
      throw checkError;
    }
    
    // If we already have sources, don't re-seed
    if (existingSources && existingSources.length > 0) {
      return new Response(
        JSON.stringify({ message: "Knowledge base already seeded", status: "skipped" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Process each knowledge item
    for (const item of logisticsKnowledge) {
      // Insert the source
      const { data: source, error: sourceError } = await supabase
        .from("context_sources")
        .insert({
          name: item.name,
          description: item.description,
          source_type: item.source_type,
          content: item.content
        })
        .select()
        .single();
        
      if (sourceError) {
        throw sourceError;
      }
      
      // Create embeddings for this content
      const embedding = await createEmbedding(item.content);
      
      // Split content into chunks (simplified - in production we'd use better chunking)
      const contentChunks = [item.content]; // Just using the full content as one chunk for demo
      
      // Insert each chunk with its embedding
      for (const chunk of contentChunks) {
        const { error: vectorError } = await supabase
          .from("knowledge_vectors")
          .insert({
            source_id: source.id,
            content: chunk,
            embedding: embedding // Store as JSON
          });
          
        if (vectorError) {
          throw vectorError;
        }
      }
    }
    
    return new Response(
      JSON.stringify({ message: "Knowledge base seeded successfully", status: "success" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error seeding knowledge base:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
