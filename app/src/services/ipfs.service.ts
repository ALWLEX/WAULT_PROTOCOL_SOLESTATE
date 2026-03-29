/**
 * IPFS Service for storing asset metadata and documents
 * In production, use Pinata, nft.storage, or web3.storage
 */

const IPFS_GATEWAY = "https://ipfs.io/ipfs";

export interface AssetMetadata {
  name: string;
  symbol: string;
  description: string;
  image?: string;
  assetType: string;
  location: string;
  totalValuation: number;
  documents: DocumentMetadata[];
  legalInfo: LegalInfo;
  propertyDetails?: PropertyDetails;
  createdAt: string;
  creator: string;
}

export interface DocumentMetadata {
  name: string;
  type: "title_deed" | "inspection" | "insurance" | "appraisal" | "other";
  hash: string;
  ipfsUri: string;
  uploadedAt: string;
}

export interface LegalInfo {
  jurisdiction: string;
  entityType: string;
  registrationNumber: string;
  complianceNotes: string;
}

export interface PropertyDetails {
  squareMeters: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  propertyType: string;
  amenities: string[];
  images: string[];
}

class IpfsService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY || "";
    this.apiUrl = "https://api.pinata.cloud";
  }

  /**
   * Upload JSON metadata to IPFS
   */
  async uploadMetadata(metadata: AssetMetadata): Promise<string> {
    try {
      // In production with Pinata:
      // const response = await fetch(`${this.apiUrl}/pinning/pinJSONToIPFS`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${this.apiKey}`,
      //   },
      //   body: JSON.stringify({
      //     pinataContent: metadata,
      //     pinataMetadata: {
      //       name: `wault-asset-${metadata.symbol}`,
      //     },
      //   }),
      // });
      // const data = await response.json();
      // return `${IPFS_GATEWAY}/${data.IpfsHash}`;

      // Demo mode: return mock URI
      const hash = this.generateMockHash(JSON.stringify(metadata));
      console.log("[IPFS] Uploaded metadata:", metadata.name, "Hash:", hash);
      return `${IPFS_GATEWAY}/${hash}`;
    } catch (error) {
      console.error("[IPFS] Upload failed:", error);
      throw new Error("Failed to upload metadata to IPFS");
    }
  }

  /**
   * Upload file (document/image) to IPFS
   */
  async uploadFile(file: File): Promise<string> {
    try {
      // In production with Pinata:
      // const formData = new FormData();
      // formData.append('file', file);
      // const response = await fetch(`${this.apiUrl}/pinning/pinFileToIPFS`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`,
      //   },
      //   body: formData,
      // });
      // const data = await response.json();
      // return `${IPFS_GATEWAY}/${data.IpfsHash}`;

      // Demo mode
      const hash = this.generateMockHash(file.name + file.size);
      console.log("[IPFS] Uploaded file:", file.name, "Hash:", hash);
      return `${IPFS_GATEWAY}/${hash}`;
    } catch (error) {
      console.error("[IPFS] File upload failed:", error);
      throw new Error("Failed to upload file to IPFS");
    }
  }

  /**
   * Fetch metadata from IPFS
   */
  async fetchMetadata(uri: string): Promise<AssetMetadata | null> {
    try {
      const response = await fetch(uri);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      console.warn("[IPFS] Failed to fetch metadata from:", uri);
      return null;
    }
  }

  /**
   * Generate hash for document verification
   */
  async generateDocumentHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  private generateMockHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `Qm${Math.abs(hash).toString(36)}${Date.now().toString(36)}MockHash`;
  }
}

export const ipfsService = new IpfsService();