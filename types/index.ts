import { Mic, Sparkles, ShieldCheck, Ticket, BookOpen } from "lucide-react"

export interface Conversation {
    id: string
    createdAt: Date
    messages?: Message[]
    title:string
}

export interface Message {
    id: string
    conversationId: string
    content: string
    role: string
    createdAt: Date
    source?: InfoSource[]
    sources?: InfoSource[]
    answer?: string
    attachments?: FileAttachment[]
    messageAttachments?: MessageAttachment[]
    audioPath?:string
}
export interface MessageAttachment {
    id: string
    name: string
    path: string
    type: string
    mimeType: string
}

export interface FileAttachment {
    id: string
    originalName: string
    externalPath: string
    fileSize: number
    mimeType: string
    isProcessed: boolean
}

export interface InfoSource {
    id?: string | number
    messageId?: string
    type?: string
    title?: string
    snippet?: string
    score?: number
    confidence?: number
    key?: string
    artifactId?: string
    imageUrl?: string
    localPath?: string
    visionResult?: any
    createdAt?: string
}

export enum ETools{
    TRANSCRIBE,
    POLICYCHECK,
    SUMMARIZE_CHAT,
    JIRA_TICKETS,
    SOCIAL_POSTING

}

export interface ITool{
    id:string,
    label:string,
    icon:any,
    desc:string,
    type:ETools
}

export const tools = [
    { id: "stt", label: "Transcribe Audio", icon: Mic, desc: "Upload and transcribe a call",type:ETools.TRANSCRIBE },
    { id: "summarize", label: "Summarize", icon: Sparkles, desc: "Summarize text for analytics",type:ETools.SUMMARIZE_CHAT },
    { id: "audit", label: "Policy Audit", icon: ShieldCheck, desc: "Check against policies",type:ETools.SOCIAL_POSTING },
    { id: "jira", label: "Create Jira", icon: Ticket, desc: "Open a ticket for follow-up",type:ETools.JIRA_TICKETS },
    { id: "policies", label: "Browse Policies", icon: BookOpen, desc: "Search policy sections",type:ETools.POLICYCHECK },
  ];
