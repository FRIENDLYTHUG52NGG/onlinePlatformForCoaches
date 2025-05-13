from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import psycopg2
import jwt
import os
from dotenv import load_dotenv
from functools import wraps
from datetime import datetime, timedelta

load_dotenv()

app = Flask(__name__)


CORS(app, supports_credentials=True, resources={
    r"/api/*": {
        "origins": ["http://localhost:*", "http://127.0.0.1:*"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Authorization"]
    }
})

bcrypt = Bcrypt(app)
app.secret_key = os.getenv("JWT_SECRET", "defaultsecret")


def get_db_connection():
    try:
        conn = psycopg2.connect(
            dbname="users",
            user="postgres",
            password="postgres",
            host="localhost",
            port="5432"
        )
        print("Успешное подключение к БД")
        return conn
    except psycopg2.Error as e:
        print(f"Ошибка подключения к БД: {e}")
        return None


@app.route('/api/register', methods=['POST'])
def register():
    print("Регистрация начата")
    data = request.get_json()
    print("Получены данные:", data)
    
    if not data:
        print("Нет данных в запросе")
        return jsonify({'message': 'Нет данных в запросе'}), 400
        
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    cpassword = data.get('cpassword')

    
    if not all([username, email, password, cpassword]):
        print("Не все поля заполнены")
        return jsonify({'message': 'Все поля обязательны'}), 400

    if password != cpassword:
        print("Пароли не совпадают")
        return jsonify({'message': 'Пароли не совпадают'}), 400

    if len(password) < 6:
        print("Пароль слишком короткий")
        return jsonify({'message': 'Пароль должен содержать минимум 6 символов'}), 400

    
    conn = get_db_connection()
    if not conn:
        print("Ошибка подключения к БД")
        return jsonify({'message': 'Ошибка подключения к БД'}), 500
        
    try:
        with conn.cursor() as cursor:
            
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                print("Email уже существует")
                return jsonify({'message': 'Email уже зарегистрирован'}), 400
            
            
            hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
            
           
            cursor.execute(
                "INSERT INTO users (username, email, password) VALUES (%s, %s, %s) RETURNING id",
                (username, email, hashed_password)
            )
            user_id = cursor.fetchone()[0]
            
            
            token = jwt.encode({
                'userId': user_id,
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, app.secret_key, algorithm='HS256')
            
            conn.commit()
            print("Пользователь создан, ID:", user_id)
            
            return jsonify({
                'token': token,
                'message': 'Регистрация успешна',
                'username': username
            }), 201
    except Exception as e:
        print("Ошибка в SQL запросе:", e)
        conn.rollback()
        return jsonify({'message': 'Ошибка сервера'}), 500
    finally:
        conn.close()


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'message': 'Токен отсутствует'}), 401
        try:
            data = jwt.decode(token, app.secret_key, algorithms=['HS256'])
            request.user_id = data['userId']
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Срок действия токена истёк'}), 403
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Недействительный токен'}), 403
        return f(*args, **kwargs)
    return decorated


@app.route('/api/dashboard', methods=['GET'])
@token_required
def dashboard():
    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Ошибка подключения к БД'}), 500
        
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT username, email FROM users WHERE id = %s", (request.user_id,))
            user = cursor.fetchone()
            if not user:
                return jsonify({'message': 'Пользователь не найден'}), 404
                
            return jsonify({
                'username': user[0], 
                'email': user[1]
            })
    except Exception as e:
        print("Ошибка в SQL запросе:", e)
        return jsonify({'message': f'Ошибка сервера: {str(e)}'}), 500
    finally:
        conn.close()


@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return jsonify({'isAuthenticated': False}), 200
    
    try:
        jwt.decode(token, app.secret_key, algorithms=['HS256'])
        return jsonify({'isAuthenticated': True}), 200
    except:
        return jsonify({'isAuthenticated': False}), 200

if __name__ == '__main__':
    app.run(port=5000, debug=True)