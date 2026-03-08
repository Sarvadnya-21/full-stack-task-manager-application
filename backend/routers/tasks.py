from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any
import models, schemas, auth, database
from fastapi.encoders import jsonable_encoder

router = APIRouter()

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_task(task: schemas.TaskCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    new_task = models.Task(
        title=task.title,
        description=task.description,
        status=task.status.value,
        user_id=current_user.id
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return {"success": True, "task": jsonable_encoder(new_task)}

@router.get("", response_model=dict)
def get_tasks(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role == models.RoleEnum.admin:
        tasks = db.query(models.Task).order_by(models.Task.created_at.desc()).all()
    else:
        tasks = db.query(models.Task).filter(models.Task.user_id == current_user.id).order_by(models.Task.created_at.desc()).all()
    
    return {"success": True, "count": len(tasks), "tasks": jsonable_encoder(tasks)}

@router.get("/{task_id}", response_model=dict)
def get_task(task_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if task.user_id != current_user.id and current_user.role != models.RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not authorized to access this task")
        
    return {"success": True, "task": jsonable_encoder(task)}

@router.put("/{task_id}", response_model=dict)
def update_task(task_id: int, task_update: schemas.TaskUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if task.user_id != current_user.id and current_user.role != models.RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not authorized to update this task")
        
    update_data = task_update.model_dump(exclude_unset=True)
    if 'status' in update_data and update_data['status'] is not None:
        update_data['status'] = update_data['status'].value
        
    for key, value in update_data.items():
        setattr(task, key, value)
        
    db.commit()
    db.refresh(task)
    return {"success": True, "task": jsonable_encoder(task)}

@router.delete("/{task_id}", response_model=dict)
def delete_task(task_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if task.user_id != current_user.id and current_user.role != models.RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this task")
        
    db.delete(task)
    db.commit()
    return {"success": True, "message": "Task deleted successfully"}
