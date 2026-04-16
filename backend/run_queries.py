import sqlite3
import sys
import os

def run_queries(db_path, sql_file):
    if not os.path.exists(sql_file):
        print(f"Error: SQL file '{sql_file}' not found.")
        return

    if not os.path.exists(db_path):
        print(f"Error: Database '{db_path}' not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_script = f.read()

        # In case the file contains multiple statements separated by colons, we execute the script using executescript, but executescript doesn't return rows.
        # So we will try execute() first for SELECT queries. If that fails (due to multiple statements), we fall back.
        statements = [s.strip() for s in sql_script.split(';') if s.strip()]
        
        for idx, statement in enumerate(statements):
            print(f"--- Executing Query {idx+1} ---")
            print(statement + ';')
            
            cursor.execute(statement)
            
            # Check if there are results
            if cursor.description:
                cols = [desc[0] for desc in cursor.description]
                
                # Simple tabular format
                col_format = "{:<20}" * len(cols)
                print("-" * (20 * len(cols)))
                print(col_format.format(*cols))
                print("-" * (20 * len(cols)))
                
                rows = cursor.fetchall()
                for row in rows:
                    row_strs = [str(x)[:19] for x in row]
                    print(col_format.format(*row_strs))
                print(f"({len(rows)} rows returned)\n")
            else:
                conn.commit()
                print("Statement executed successfully.\n")

    except sqlite3.Error as e:
        print(f"\nDatabase error: {e}")
    except Exception as e:
        print(f"\nError: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    db_file = 'db.sqlite3'
    query_file = 'queries.sql'
    
    if len(sys.argv) > 1:
        query_file = sys.argv[1]
        
    run_queries(db_file, query_file)
