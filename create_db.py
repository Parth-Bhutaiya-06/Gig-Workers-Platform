import MySQLdb

try:
    db = MySQLdb.connect(host="localhost", user="root", passwd="")
    cursor = db.cursor()
    cursor.execute("CREATE DATABASE IF NOT EXISTS gig_platform_db")
    print("Database created or already exists.")
    db.close()
except Exception as e:
    print(f"Error: {e}")
