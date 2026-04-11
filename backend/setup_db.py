import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

try:
    # Connect to the default master database
    conn = psycopg2.connect(
        dbname="postgres", 
        user="postgres", 
        password="nexus123", 
        host="localhost"
    )
    
    # We must enable autocommit to run CREATE DATABASE commands
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()

    print("Connected to PostgreSQL! Creating Nexus database...")

    # Run the SQL commands
    cursor.execute("CREATE DATABASE nexus_db;")
    cursor.execute("CREATE USER nexus_admin WITH PASSWORD 'securepassword123';")
    cursor.execute("ALTER ROLE nexus_admin SET client_encoding TO 'utf8';")
    cursor.execute("ALTER ROLE nexus_admin SET default_transaction_isolation TO 'read committed';")
    cursor.execute("ALTER ROLE nexus_admin SET timezone TO 'UTC';")
    cursor.execute("GRANT ALL PRIVILEGES ON DATABASE nexus_db TO nexus_admin;")

    print("Success! The nexus_db database and user are ready for Django.")

    cursor.close()
    conn.close()

except Exception as e:
    print(f"Error: {e}")