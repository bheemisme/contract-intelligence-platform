from dotenv import load_dotenv
from model import fill
from contracts import schemas, dal
from database import db
# import contracts.schemas as schemas

def main():
    print("Hello from contract-intelligence-platform!")


if __name__ == "__main__":
    load_dotenv()
    output = fill.fill_schema("data/extracts/nda-1.md", schemas.NDAContract)
    # print(output)
    dal.add_contract(db.get_firestore_connection(), output)
    # main()
