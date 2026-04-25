from fastapi import APIRouter, HTTPException
from database import supabase

router = APIRouter(prefix="/api/hospital", tags=["Hospital"])

@router.get("/queue")
async def get_triage_queue():
    if not supabase: return [] 
    try:
        response = supabase.table("triage_requests").select("*").order("createdAt", desc=True).execute()
        return response.data
    except: return []

@router.get("/doctors")
async def get_doctors():
    if not supabase: return []
    try:
        response = supabase.table("hospital_doctors").select("*").execute()
        return response.data
    except: return []

@router.post("/doctors/add")
async def add_doctor(doc: dict):
    if not supabase: return {"status": "error"}
    try:
        payload = {
            "name": doc.get("name"),
            "specialization": doc.get("specialty"),
            "experience": 5,
            "fee": 500
        }
        response = supabase.table("hospital_doctors").insert(payload)
        return {"status": "success", "data": response.data}
    except: raise HTTPException(status_code=500, detail="Failed to add doctor")

@router.delete("/doctors/{doc_id}")
async def delete_doctor(doc_id: str):
    if not supabase: return
    # Delete associated appointments first to clear foreign key constraints
    print(f"Attempting to delete appointments for doctor {doc_id}...")
    res1 = supabase.table("appointments").eq("doctorId", doc_id).delete()
    print(f"Appointments delete response: {res1.data}")
    
    # Now safely delete the doctor
    print(f"Attempting to delete doctor {doc_id}...")
    res2 = supabase.table("hospital_doctors").eq("id", doc_id).delete()
    print(f"Doctor delete response: {res2.data}")
    return {"status": "success"}

@router.post("/assign-doctor")
async def assign_doctor(data: dict):
    """Assigns doctor, creates appointment, and tags the triage request."""
    if not supabase: return
    try:
        p_id = data.get("patient_id")
        d_id = data.get("doctor_id")
        d_name = data.get("doctor_name", "Assigned Doctor")
        a_date = data.get("appointment_date")

        # Fetch the original triage request to get the actual user ID (patientId)
        existing = supabase.table("triage_requests").select("*").eq("id", p_id).execute()
        triage_row = existing.data[0] if existing.data else {}
        actual_patient_id = triage_row.get("patientId")

        # 1. Create/Update Appointment
        payload = {
            "patientRequestId": p_id,
            "doctorId": d_id,
            "doctorName": d_name,
            "timeSlot": a_date,
            "status": "SCHEDULED",
            "patientId": actual_patient_id
        }
        supabase.table("appointments").insert(payload)

        # 2. Update Triage Request with status AND assigned doctor info
        triage_data = triage_row.get("triage", {})
        triage_data["assignedDoctor"] = d_name
        triage_data["assignedDoctorId"] = d_id
        triage_data["appointmentDate"] = a_date
        
        supabase.table("triage_requests").eq("id", p_id).update({
            "status": "ASSIGNED",
            "triage": triage_data
        })
        
        return {"status": "success"}
    except Exception as e:
        print(f"ASSIGN ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))
