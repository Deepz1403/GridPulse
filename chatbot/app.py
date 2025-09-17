import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import pymongo
from sentence_transformers import SentenceTransformer
import numpy as np
from datetime import datetime
import logging 
import requests
import json
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Config:
    MONGO_URI = "mongodb+srv://usergrid:grid123@cluster0.3rcas.mongodb.net/Grids?retryWrites=true&w=majority&appName=Cluster0"
    DB_NAME = "Grids"
    COLLECTIONS = {
        "substations": "substations",
        "ss4_data": "ss-4", 
        "ss5_data": "ss-5",
        "attendants": "attendants",
        "conversations": "gridconversations"
    }
    MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
    TOP_K_RESULTS = 5
    
config = Config()

# Enhanced MongoDB Handler for Grid Data
class GridMongoDBHandler:
    def __init__(self):
        self.client = pymongo.MongoClient(config.MONGO_URI)
        self.db = self.client[config.DB_NAME]
        
        # Initialize collections
        self.collections = {}
        for key, collection_name in config.COLLECTIONS.items():
            self.collections[key] = self.db[collection_name]
            
        logger.info("Grid MongoDB connection established with all collections")
        
    def get_collection_stats(self):
        """Get statistics for all collections"""
        stats = {}
        for key, collection in self.collections.items():
            try:
                count = collection.count_documents({})
                sample_doc = list(collection.find({}).limit(1))
                stats[key] = {
                    'name': config.COLLECTIONS[key],
                    'document_count': count,
                    'sample_structure': list(sample_doc[0].keys()) if sample_doc else []
                }
            except Exception as e:
                stats[key] = {'error': str(e)}
        return stats
        
    def search_all_collections(self, query_embedding, limit_per_collection=2):
        """Search across all grid collections"""
        all_results = []
        
        for collection_key, collection in self.collections.items():
            try:
                results = self.search_grid_collection(
                    collection_key, collection, query_embedding, limit_per_collection
                )
                for result in results:
                    result['source_collection'] = collection_key
                all_results.extend(results)
            except Exception as e:
                logger.error(f"Error searching {collection_key}: {e}")
                
        # Sort all results by similarity
        all_results.sort(key=lambda x: x.get('similarity', 0), reverse=True)
        return all_results[:config.TOP_K_RESULTS]
    
    def search_grid_collection(self, collection_key, collection, query_embedding, limit):
        """Search specific collection based on grid data structure"""
        try:
            documents = list(collection.find({}).limit(50))
        except Exception as e:
            logger.error(f"Error fetching documents from {collection_key}: {e}")
            return []
        
        if not documents:
            return []
            
        # Create searchable content based on collection type
        searchable_texts = []
        for doc in documents:
            searchable_text = self.create_searchable_text(doc, collection_key)
            searchable_texts.append(searchable_text)
        
        if not searchable_texts or not any(searchable_texts):
            return []
            
        try:
            # Generate embeddings and calculate similarities
            doc_embeddings = embedding_service.batch_generate_embeddings(searchable_texts)
            similarities = cosine_similarity([query_embedding], doc_embeddings)[0]
            
            # Add similarity scores
            for i, doc in enumerate(documents):
                doc['similarity'] = float(similarities[i])
                doc['searchable_text'] = searchable_texts[i]
                
            # Sort and return top results
            documents.sort(key=lambda x: x['similarity'], reverse=True)
            return documents[:limit]
            
        except Exception as e:
            logger.error(f"Error in similarity calculation for {collection_key}: {e}")
            return []
    
    def create_searchable_text(self, doc, collection_key):
        """Create searchable text based on document structure"""
        if collection_key == "substations":
            # Handle substation configuration data
            text_parts = [
                f"Substation: {doc.get('substationName', 'Unknown')}",
                f"Location: {doc.get('location', 'Unknown')}",
                f"Temperature: {doc.get('temperature', 'N/A')}°C",
                f"Total Units: {doc.get('totalUnitsConsumed', 'N/A')}"
            ]
            
            # Add attendant emails
            attendant_emails = doc.get('attendantEmails', [])
            if attendant_emails:
                text_parts.append(f"Attendants: {', '.join(attendant_emails)}")
            
            # Add transformer information
            transformers = doc.get('transformers', [])
            for i, transformer in enumerate(transformers):
                if isinstance(transformer, dict):
                    tr_text = f"Transformer {transformer.get('id', i+1)}: "
                    tr_text += f"Voltage: {transformer.get('voltage', 'N/A')}V, "
                    tr_text += f"Current: {transformer.get('current', 'N/A')}A, "
                    tr_text += f"Consumption: {transformer.get('consumption', 'N/A')}"
                    
                    # Add area information
                    areas = transformer.get('areas', {})
                    if areas:
                        area_info = [f"{area}: {value}" for area, value in areas.items() if value is not None]
                        if area_info:
                            tr_text += f" Areas: {'; '.join(area_info[:5])}"  # Limit to first 5 areas
                    
                    text_parts.append(tr_text)
            
            return " | ".join(text_parts)
            
        elif collection_key in ["ss4_data", "ss5_data"]:
            # Handle time-series transformer data
            station_name = "SS-4" if collection_key == "ss4_data" else "SS-5"
            text_parts = [
                f"Station: {station_name}",
                f"Date: {doc.get('Date', 'Unknown')}",
                f"Time: {doc.get('Time', 'Unknown')}",
                f"Temperature: {doc.get('temperature', 'N/A')}°C",
                f"Total Units Consumed: {doc.get('totalUnitsConsumed', 'N/A')}",
                f"Submitted by: {doc.get('submittedBy', 'Unknown')}"
            ]
            
            # Add transformer readings
            transformers = doc.get('transformers', [])
            for transformer in transformers:
                if isinstance(transformer, dict):
                    tr_text = f"Transformer {transformer.get('id', 'Unknown')}: "
                    tr_text += f"Voltage: {transformer.get('voltage', 'N/A')}V, "
                    tr_text += f"Current: {transformer.get('current', 'N/A')}A, "
                    tr_text += f"Consumption: {transformer.get('Consumption', transformer.get('consumption', 'N/A'))}"
                    
                    # Add critical area readings
                    areas = transformer.get('areas', {})
                    if areas:
                        # Focus on non-zero readings
                        active_areas = [(area, value) for area, value in areas.items() 
                                      if value not in [None, 0, "0"]]
                        if active_areas:
                            area_info = [f"{area}: {value}" for area, value in active_areas[:3]]
                            tr_text += f" Active Areas: {'; '.join(area_info)}"
                    
                    text_parts.append(tr_text)
            
            return " | ".join(text_parts)
            
        elif collection_key == "attendants":
            # Handle attendant data
            return f"Name: {doc.get('name', '')} | Role: {doc.get('role', '')} | Substation: {doc.get('substation', '')} | Email: {doc.get('email', '')}"
            
        elif collection_key == "conversations":
            # Handle conversation data
            return f"Message: {doc.get('message', '')} | User: {doc.get('user', '')} | Timestamp: {doc.get('timestamp', '')}"
            
        else:
            # Generic handling
            return " ".join([str(v) for k, v in doc.items() 
                           if isinstance(v, (str, int, float)) and k != '_id' and v != ""])[:500]

# Initialize database handler
db_handler = GridMongoDBHandler()

class FreeEmbedding:
    def __init__(self):
        self.model = SentenceTransformer(config.MODEL_NAME)
        logger.info("Grid Embedding model loaded successfully")
        
    def generate_embedding(self, text):
        """Generate embedding using sentence-transformers"""
        if not text or not text.strip():
            return [0.0] * 384  # Return zero vector for empty text
        embedding = self.model.encode(text, convert_to_tensor=False)
        return embedding.tolist()
    
    def batch_generate_embeddings(self, texts):
        """Generate embeddings for multiple texts"""
        # Filter out empty texts
        filtered_texts = [text if text and text.strip() else "no data" for text in texts]
        embeddings = self.model.encode(filtered_texts, convert_to_tensor=False)
        return embeddings.tolist()

embedding_service = FreeEmbedding()

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        
    def generate_grid_response(self, query, context):
        """Generate response for grid management queries"""
        prompt = f"""You are an intelligent assistant for an electrical grid management system. You have access to real-time data from substations SS-4 and SS-5, including:

- Substation configurations and attendant assignments
- Real-time transformer readings (voltage, current, consumption)
- Power distribution across different areas (hostels, buildings, facilities)
- Temperature monitoring
- Historical consumption patterns

Based on the following grid data, provide a comprehensive and helpful answer:

{context}

User Question: {query}

Instructions:
- Provide specific technical information when available (voltages, currents, power consumption)
- Reference specific dates, times, and measurements from the data
- Identify trends, anomalies, or concerning readings if relevant
- Suggest maintenance actions if issues are detected
- Be concise but thorough in your technical analysis

Answer:"""
        
        url = f"{self.base_url}/models/gemini-2.5-flash:generateContent?key={self.api_key}"
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.3,  # Lower temperature for technical accuracy
                "maxOutputTokens": 800
            }
        }
        
        try:
            response = requests.post(url, json=payload)
            if response.status_code == 200:
                data = response.json()
                return data['candidates'][0]['content']['parts'][0]['text']
            else:
                logger.error(f"Gemini API error: {response.status_code} - {response.text}")
                return "I apologize, but I encountered an error generating a response."
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return "I apologize, but I encountered an error generating a response."

gemini_service = GeminiService()

class GridRAGPipeline:
    def __init__(self):   
        self.gemini_service = GeminiService()
        
    def retrieve_context_from_grid(self, query):
        """Retrieve relevant context from all grid collections"""
        query_embedding = embedding_service.generate_embedding(query)
        similar_docs = db_handler.search_all_collections(query_embedding)
        
        context_sections = {
            'substation_config': "",
            'ss4_readings': "",
            'ss5_readings': "",
            'personnel': "",
            'conversations': ""
        }
        
        sources = []
        
        for doc in similar_docs:
            collection_type = doc.get('source_collection', 'unknown')
            doc_content = self.format_grid_document(doc, collection_type)
            
            # Categorize context
            if collection_type == 'substations':
                context_sections['substation_config'] += f"{doc_content}\n\n"
            elif collection_type == 'ss4_data':
                context_sections['ss4_readings'] += f"{doc_content}\n\n"
            elif collection_type == 'ss5_data':
                context_sections['ss5_readings'] += f"{doc_content}\n\n"
            elif collection_type == 'attendants':
                context_sections['personnel'] += f"{doc_content}\n\n"
            elif collection_type == 'conversations':
                context_sections['conversations'] += f"{doc_content}\n\n"
            
            sources.append({
                'id': str(doc['_id']),
                'similarity': doc.get('similarity', 0),
                'collection': collection_type,
                'date': doc.get('Date', 'N/A'),
                'preview': doc_content[:150] + "..." if len(doc_content) > 150 else doc_content
            })
        
        # Combine all context sections
        full_context = ""
        for section_name, content in context_sections.items():
            if content.strip():
                full_context += f"\n=== {section_name.upper().replace('_', ' ')} ===\n{content}\n"
        
        return full_context, sources
    
    def format_grid_document(self, doc, collection_type):
        """Format document content for display"""
        if collection_type == 'substations':
            lines = [f"SUBSTATION: {doc.get('substationName', 'Unknown')}"]
            lines.append(f"Location: {doc.get('location', 'Unknown')}")
            lines.append(f"Current Temperature: {doc.get('temperature', 'N/A')}°C")
            
            # Attendant information
            attendants = doc.get('attendantEmails', [])
            if attendants:
                lines.append(f"Assigned Attendants: {', '.join(attendants)}")
            
            # Transformer summary
            transformers = doc.get('transformers', [])
            for transformer in transformers:
                if isinstance(transformer, dict):
                    tr_id = transformer.get('id', 'Unknown')
                    voltage = transformer.get('voltage', 'N/A')
                    current = transformer.get('current', 'N/A')
                    consumption = transformer.get('consumption', 'N/A')
                    lines.append(f"Transformer {tr_id}: {voltage}V, {current}A, Consumption: {consumption}")
            
            return "\n".join(lines)
            
        elif collection_type in ['ss4_data', 'ss5_data']:
            station = 'SS-4' if collection_type == 'ss4_data' else 'SS-5'
            lines = [f"STATION: {station} - Reading from {doc.get('Date', 'Unknown')} at {doc.get('Time', 'Unknown')}"]
            lines.append(f"Temperature: {doc.get('temperature', 'N/A')}°C")
            lines.append(f"Total Units Consumed: {doc.get('totalUnitsConsumed', 'N/A')}")
            lines.append(f"Submitted by: {doc.get('submittedBy', 'Unknown')}")
            
            # Transformer readings
            transformers = doc.get('transformers', [])
            for transformer in transformers:
                if isinstance(transformer, dict):
                    tr_id = transformer.get('id', 'Unknown')
                    voltage = transformer.get('voltage', 'N/A')
                    current = transformer.get('current', 'N/A')
                    consumption = transformer.get('Consumption', transformer.get('consumption', 'N/A'))
                    
                    tr_line = f"Transformer {tr_id}: {voltage}V, {current}A, Consumption: {consumption}"
                    
                    # Add area information for significant loads
                    areas = transformer.get('areas', {})
                    if areas:
                        significant_areas = [(k, v) for k, v in areas.items() 
                                           if v not in [None, 0, "0"] and v != ""]
                        if significant_areas:
                            area_summary = ", ".join([f"{area}: {load}" for area, load in significant_areas[:3]])
                            tr_line += f" | Key loads: {area_summary}"
                    
                    lines.append(tr_line)
            
            return "\n".join(lines)
            
        elif collection_type == 'attendants':
            return f"ATTENDANT: {doc.get('name', 'Unknown')} - {doc.get('role', 'N/A')} at {doc.get('substation', 'N/A')} (Contact: {doc.get('email', 'N/A')})"
            
        elif collection_type == 'conversations':
            return f"CONVERSATION: {doc.get('message', '')} (User: {doc.get('user', 'Unknown')}, Time: {doc.get('timestamp', 'N/A')})"
            
        else:
            return str(doc.get('_id', 'Unknown document'))
    
    def generate_response(self, query, context):
        """Generate response using Gemini with grid context"""
        try:
            response = self.gemini_service.generate_grid_response(query, context)
            return response
        except Exception as e:
            logger.error(f"Grid LLM generation error: {e}")
            return "I apologize, but I encountered an error generating a response."

rag_pipeline = GridRAGPipeline()

# API Endpoints

@app.route('/chat', methods=['POST'])
def chat():
    """Enhanced chat endpoint for grid management queries"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        if not query:
            return jsonify({'error': 'Query is required'}), 400
            
        logger.info(f"Processing grid query: {query}")
        
        # Get statistics of all collections
        collection_stats = db_handler.get_collection_stats()
        total_docs = sum(stat.get('document_count', 0) for stat in collection_stats.values() if 'document_count' in stat)
        
        if total_docs == 0:
            return jsonify({
                'query': query,
                'response': 'No grid data found in the system. Please ensure substation data has been uploaded.',
                'sources': [],
                'collection_stats': collection_stats,
                'timestamp': datetime.utcnow().isoformat()
            })
        
        # Retrieve context from all grid collections
        context, sources = rag_pipeline.retrieve_context_from_grid(query)
        
        if not context.strip():
            return jsonify({
                'query': query,
                'response': 'No relevant grid information found for your query. Please try asking about substation status, transformer readings, or power consumption.',
                'sources': sources,
                'collection_stats': collection_stats,
                'timestamp': datetime.utcnow().isoformat()
            })
        
        # Generate comprehensive response
        response = rag_pipeline.generate_response(query, context)
        
        return jsonify({
            'query': query,
            'response': response,
            'sources': sources,
            'collections_searched': list(config.COLLECTIONS.keys()),
            'total_documents_available': total_docs,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Grid chat endpoint error: {e}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/grid/status', methods=['GET'])
def grid_status():
    """Get overall grid system status"""
    try:
        stats = db_handler.get_collection_stats()
        
        # Get latest readings from each substation
        latest_ss4 = list(db_handler.collections['ss4_data'].find({}).sort([('Date', -1), ('Time', -1)]).limit(1))
        latest_ss5 = list(db_handler.collections['ss5_data'].find({}).sort([('Date', -1), ('Time', -1)]).limit(1))
        
        status_summary = {
            'system_status': 'operational',
            'collections': stats,
            'latest_readings': {
                'ss4': latest_ss4[0] if latest_ss4 else None,
                'ss5': latest_ss5[0] if latest_ss5 else None
            },
            'total_substations': db_handler.collections['substations'].count_documents({}),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        return jsonify(status_summary)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/substation/<station_id>/latest', methods=['GET'])
def get_latest_readings(station_id):
    """Get latest readings for specific substation"""
    try:
        if station_id.lower() == 'ss-4':
            collection = db_handler.collections['ss4_data']
        elif station_id.lower() == 'ss-5':
            collection = db_handler.collections['ss5_data']
        else:
            return jsonify({'error': 'Invalid station ID. Use ss-4 or ss-5'}), 400
        
        latest_reading = list(collection.find({}).sort([('Date', -1), ('Time', -1)]).limit(1))
        
        if not latest_reading:
            return jsonify({'error': f'No readings found for {station_id}'}), 404
        
        # Convert ObjectId to string for JSON serialization
        reading = latest_reading[0]
        reading['_id'] = str(reading['_id'])
        
        return jsonify({
            'station_id': station_id,
            'latest_reading': reading,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        db_handler.client.admin.command('ping')
        
        # Count documents in each collection
        collection_counts = {}
        for key, collection in db_handler.collections.items():
            collection_counts[key] = collection.count_documents({})
        
        return jsonify({
            'status': 'healthy',
            'database_connected': True,
            'collections': collection_counts,
            'embedding_model': config.MODEL_NAME,
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@app.route('/', methods=['GET'])
def index():
    """Root endpoint with grid API information"""
    return jsonify({
        'message': 'Grid Management RAG Chatbot API',
        'version': '2.0.0',
        'description': 'AI assistant for electrical grid monitoring and management',
        'endpoints': {
            'POST /chat': 'Chat with the grid AI assistant',
            'GET /grid/status': 'Get overall grid system status',
            'GET /substation/<id>/latest': 'Get latest readings for specific substation',
            'GET /health': 'Health check'
        },
        'supported_substations': ['ss-4', 'ss-5'],
        'capabilities': [
            'Real-time transformer monitoring',
            'Power consumption analysis', 
            'Temperature monitoring',
            'Load distribution tracking',
            'Historical data analysis',
            'Attendant management'
        ]
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Initialize database indexes
    try:
        for collection in db_handler.collections.values():
            collection.create_index("Date")
            collection.create_index("Time") 
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
    
    logger.info("Starting Grid Management RAG Chatbot server...")
    
    # Run the application
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
