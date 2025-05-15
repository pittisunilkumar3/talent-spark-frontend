# Resume Matching RAG Workflow Documentation

## Overview

This document outlines the implementation of the Resume Matching system using Retrieval-Augmented Generation (RAG) with n8n workflow automation. The system aims to:

1. Process and parse uploaded resumes to extract key information
2. Store resume data in a vector database for semantic search
3. Match job descriptions with candidate profiles 
4. Provide accurate candidate recommendations for open positions

## System Architecture

### Components

1. **Backend API** - The Talent Spark Recruit backend with resume parsing and job matching endpoints
2. **n8n Workflow** - Processing pipeline for document analysis and semantic search
3. **Vector Database** - PostgreSQL with pgvector extension for semantic search
4. **LLM Integration** - AI model integration for understanding resumes and job descriptions

### Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Resume      │     │ Document    │     │ Text        │     │ Vector      │
│ Upload      │────▶│ Processing  │────▶│ Embedding   │────▶│ Database    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                  │
┌─────────────┐     ┌─────────────┐     ┌─────────────┐          │
│ Job         │     │ Semantic    │     │ Candidate   │          │
│ Description │────▶│ Search      │◀───▶│ Ranking     │◀─────────┘
└─────────────┘     └─────────────┘     └─────────────┘
```

## Workflow Implementation in n8n

The provided n8n workflow implements a sophisticated document processing pipeline for resume analysis and job matching. Here's a breakdown of the key components:

### 1. Document Ingestion

- **Triggers**: File uploads to specified directories
- **Processing**:
  - Identifies document type (.pdf, .docx, .txt)
  - Extracts text content appropriate to the file type
  - Assigns unique file IDs and metadata

### 2. Text Processing and Embedding

- **Text Extraction**:
  - PDF parsing for resumes
  - Text cleanup and normalization
- **Chunking**:
  - Splits documents into manageable chunks for processing
  - Maintains context across chunks
- **Embedding Generation**:
  - Uses Ollama for generating vector embeddings
  - Converts text to high-dimensional vectors for semantic search

### 3. Database Storage

- **Document Metadata**:
  - Stores file information and schema in document_metadata table
- **Vector Storage**:
  - Stores text embeddings in pgvector-enabled database
  - Enables semantic similarity search
- **Structured Data**:
  - Stores structured resume data (education, experience, skills)
  - Facilitates precise filtering and matching

### 4. Retrieval and Matching

- **Job Description Processing**:
  - Extracts key requirements and qualifications
  - Generates embeddings for semantic search
- **Candidate Matching**:
  - Performs vector similarity search
  - Ranks candidates based on relevance to job requirements
- **Results Delivery**:
  - Returns ranked list of matching candidates
  - Provides match scores and justifications

## Integration with Backend

To integrate this n8n workflow with the Talent Spark backend, the following steps are required:

### 1. API Integration

```javascript
// In resumeController.ts
import axios from 'axios';

// Endpoint to trigger resume processing
export const processResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const { resumeUrl } = req.body;
    
    // Call n8n webhook to process resume
    const response = await axios.post(process.env.N8N_WEBHOOK_URL, {
      resumeUrl,
      fileId: `resume_${Date.now()}`,
      fileType: resumeUrl.split('.').pop(),
      fileName: resumeUrl.split('/').pop()
    });
    
    res.status(200).json({
      message: 'Resume processing initiated',
      processingId: response.data.processingId
    });
  } catch (error) {
    logger.error(`Error triggering resume processing: ${error}`);
    res.status(500).json({ message: 'Error triggering resume processing' });
  }
};

// Endpoint to match job with candidates
export const matchJobWithCandidates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId, jobDescription, requiredSkills } = req.body;
    
    // Call n8n webhook for job matching
    const response = await axios.post(process.env.N8N_JOB_MATCH_WEBHOOK_URL, {
      jobId,
      jobDescription,
      requiredSkills
    });
    
    res.status(200).json({
      message: 'Job matching initiated',
      matchingId: response.data.matchingId,
      candidates: response.data.candidates || []
    });
  } catch (error) {
    logger.error(`Error matching job with candidates: ${error}`);
    res.status(500).json({ message: 'Error matching job with candidates' });
  }
};

// Endpoint to get processing results
export const getProcessingResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const { processingId } = req.params;
    
    // Query processing results from database
    const results = await prisma.resumeProcessing.findUnique({
      where: { id: processingId }
    });
    
    if (!results) {
      res.status(404).json({ message: 'Processing results not found' });
      return;
    }
    
    res.status(200).json({
      message: 'Processing results retrieved',
      results
    });
  } catch (error) {
    logger.error(`Error retrieving processing results: ${error}`);
    res.status(500).json({ message: 'Error retrieving processing results' });
  }
};
```

### 2. Database Setup

Ensure the PostgreSQL database has the pgvector extension installed and create the necessary tables:

```sql
-- Install pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create document_metadata table
CREATE TABLE IF NOT EXISTS document_metadata (
    id TEXT PRIMARY KEY,
    title TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    schema TEXT
);

-- Create document_rows table for tabular data
CREATE TABLE IF NOT EXISTS document_rows (
    id SERIAL PRIMARY KEY,
    dataset_id TEXT REFERENCES document_metadata(id),
    row_data JSONB  -- Store the actual row data
);

-- Create resumes table for extracted resume data
CREATE TABLE IF NOT EXISTS resumes (
    id SERIAL PRIMARY KEY,
    file_id TEXT REFERENCES document_metadata(id),
    candidate_id INTEGER,
    parsed_data JSONB,
    embedding VECTOR(768),  -- Adjust dimension based on embedding model
    processing_status TEXT,
    processing_date TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (candidate_id) REFERENCES users(id)
);

-- Create job_matches table
CREATE TABLE IF NOT EXISTS job_matches (
    id SERIAL PRIMARY KEY,
    job_id INTEGER,
    resume_id INTEGER,
    match_score FLOAT,
    match_reason TEXT,
    match_date TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (resume_id) REFERENCES resumes(id)
);
```

### 3. Environment Configuration

Add the following environment variables to connect the backend with n8n:

```
# n8n Integration
N8N_BASE_URL=http://localhost:5678
N8N_WEBHOOK_URL=http://localhost:5678/webhook/bf4dd093-bb02-472c-9454-7ab9af97bd1d
N8N_JOB_MATCH_WEBHOOK_URL=http://localhost:5678/webhook/job-match
N8N_API_KEY=your_n8n_api_key
```

## Enhanced Resume Matching Workflow

To implement the desired workflow for matching resumes with job descriptions, the following process is recommended:

### 1. Resume Ingestion and Chunking

- **Upload**: Candidate uploads resume or applies with resume
- **Processing**: 
  - Extract text from various document formats
  - Split into meaningful chunks preserving context
  - Store chunks with appropriate metadata (section identification)

### 2. Semantic Understanding

- **Entity Extraction**:
  - Identify and extract skills, education, experience
  - Recognize certifications, achievements
  - Map to standardized skill taxonomy
- **Embedding Generation**:
  - Create vector representations of resume content
  - Generate separate embeddings for different resume sections
  - Create composite embedding for the entire document

### 3. Job Description Analysis

- **Requirement Extraction**:
  - Parse job descriptions for required skills
  - Identify must-have vs. nice-to-have qualifications
  - Extract experience level, education requirements
- **Embedding Generation**:
  - Create vector representations of job requirements
  - Generate embeddings for specific requirement categories

### 4. Advanced Matching Algorithm

- **Vector Similarity**:
  - Compare job requirement embeddings with resume section embeddings
  - Calculate similarity scores for different aspects
- **Weighting System**:
  - Apply weights to different matching criteria
  - Consider must-have requirements more heavily
- **Candidate Ranking**:
  - Generate comprehensive match score
  - Provide explanation for match reasoning
  - Identify skill gaps or areas of exceptional match

### 5. Continuous Learning

- **Feedback Loop**:
  - Incorporate recruiter feedback on match quality
  - Adjust algorithm based on successful hires
  - Improve skill recognition and matching over time

## Implementation Recommendations

### 1. Extend n8n Workflow

Modify the provided n8n workflow to:

1. Add more sophisticated text extraction for resumes
2. Implement structured entity recognition for skills/experience
3. Create a more nuanced matching algorithm with weights
4. Add feedback collection mechanisms

### 2. Backend Enhancements

Add these features to the backend:

1. **Resume Parsing API**:
   ```typescript
   // Enhanced resume parsing function
   export const enhancedResumeParser = async (resumeText: string): Promise<any> => {
     try {
       // Extract structured data from resume text
       const sections = extractResumeSections(resumeText);
       
       // Process each section appropriately
       const skills = extractSkills(sections.skills || '');
       const education = extractEducation(sections.education || '');
       const experience = extractExperience(sections.experience || '');
       
       // Generate embeddings for each section
       const embeddings = {
         skills: await generateEmbeddings(sections.skills || ''),
         education: await generateEmbeddings(sections.education || ''),
         experience: await generateEmbeddings(sections.experience || ''),
         full: await generateEmbeddings(resumeText)
       };
       
       return {
         structured: {
           skills,
           education,
           experience
         },
         embeddings
       };
     } catch (error) {
       logger.error(`Enhanced resume parsing error: ${error}`);
       throw new Error('Resume parsing failed');
     }
   };
   ```

2. **Job Matching API**:
   ```typescript
   // Enhanced job matching function
   export const enhancedJobMatcher = async (jobDescription: string, candidates: any[]): Promise<any[]> => {
     try {
       // Extract job requirements
       const requirements = extractJobRequirements(jobDescription);
       
       // Generate embeddings for job requirements
       const requirementsEmbedding = await generateEmbeddings(requirements.join(' '));
       
       // Calculate match scores for each candidate
       const matchedCandidates = candidates.map(candidate => {
         // Calculate similarity scores
         const skillsSimilarity = calculateCosineSimilarity(
           requirementsEmbedding, 
           candidate.embeddings.skills
         );
         
         const experienceSimilarity = calculateCosineSimilarity(
           requirementsEmbedding, 
           candidate.embeddings.experience
         );
         
         const overallSimilarity = calculateCosineSimilarity(
           requirementsEmbedding, 
           candidate.embeddings.full
         );
         
         // Calculate weighted score
         const matchScore = (
           skillsSimilarity * 0.5 + 
           experienceSimilarity * 0.3 + 
           overallSimilarity * 0.2
         );
         
         return {
           candidate,
           matchScore,
           breakdown: {
             skillsSimilarity,
             experienceSimilarity,
             overallSimilarity
           }
         };
       });
       
       // Sort by match score
       return matchedCandidates.sort((a, b) => b.matchScore - a.matchScore);
     } catch (error) {
       logger.error(`Enhanced job matching error: ${error}`);
       throw new Error('Job matching failed');
     }
   };
   ```

### 3. Database Schema Updates

Extend the PostgreSQL schema to support the enhanced workflow:

```sql
-- Add columns to resumes table
ALTER TABLE resumes ADD COLUMN skills_embedding VECTOR(768);
ALTER TABLE resumes ADD COLUMN experience_embedding VECTOR(768);
ALTER TABLE resumes ADD COLUMN education_embedding VECTOR(768);
ALTER TABLE resumes ADD COLUMN extracted_skills JSONB;
ALTER TABLE resumes ADD COLUMN extracted_education JSONB;
ALTER TABLE resumes ADD COLUMN extracted_experience JSONB;

-- Add columns to jobs table
ALTER TABLE jobs ADD COLUMN requirements_embedding VECTOR(768);
ALTER TABLE jobs ADD COLUMN extracted_requirements JSONB;
```

## Deployment Steps

1. **Set up n8n Server**:
   - Install n8n on a server or container
   - Import the provided workflow
   - Configure webhook endpoints

2. **Database Configuration**:
   - Install PostgreSQL with pgvector extension
   - Create necessary tables and indices
   - Set up proper access rights

3. **Backend Deployment**:
   - Update backend with new API endpoints
   - Configure environment variables for n8n integration
   - Deploy backend to server

4. **Testing**:
   - Upload sample resumes to verify processing
   - Create job descriptions and test matching
   - Validate match scores and candidate ranking

5. **Monitoring**:
   - Set up logging for workflow execution
   - Monitor performance and accuracy
   - Collect feedback for continuous improvement

## Conclusion

This RAG-based resume matching system provides a sophisticated approach to identifying the best candidates for open positions. By leveraging semantic search, vector embeddings, and structured data extraction, it offers more accurate matching than traditional keyword-based systems. The integration with n8n allows for flexible workflow automation and easy scaling as the application grows.

The system can be further enhanced by:

1. Implementing domain-specific language models for better understanding of technical resumes
2. Adding multi-language support for international candidates
3. Incorporating behavioral and cultural fit analysis
4. Developing a feedback loop to continuously improve matching accuracy
5. Integrating with external job boards and recruitment platforms