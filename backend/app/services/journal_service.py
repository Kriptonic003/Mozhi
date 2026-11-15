"""
Journal entry database operations and business logic.
"""
from typing import Optional, Tuple, List
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.models.journal import JournalEntry
from app.schemas.journal import JournalEntryCreate, JournalEntryUpdate


class JournalService:
    @staticmethod
    def create_entry(db: Session, user_id: int, entry_in: JournalEntryCreate) -> JournalEntry:
        entry = JournalEntry(
            user_id=user_id,
            title=entry_in.title,
            audio_path=entry_in.audio_path,
            original_transcript=entry_in.original_transcript,
            edited_transcript=entry_in.edited_transcript or entry_in.original_transcript,
            english_translation=entry_in.english_translation,
            polished_entry=entry_in.polished_entry,
            summary=entry_in.summary,
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry

    @staticmethod
    def get_user_entries(
        db: Session,
        user_id: int,
        page: int = 1,
        limit: int = 20,
        search: Optional[str] = None
    ) -> Tuple[List[JournalEntry], int]:
        query = db.query(JournalEntry).filter(JournalEntry.user_id == user_id)

        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                or_(
                    JournalEntry.title.ilike(search_filter),
                    JournalEntry.edited_transcript.ilike(search_filter),
                    JournalEntry.original_transcript.ilike(search_filter),
                    JournalEntry.summary.ilike(search_filter)
                )
            )

        total = query.count()
        offset = (page - 1) * limit
        items = query.order_by(desc(JournalEntry.created_at)).offset(offset).limit(limit).all()

        return items, total

    @staticmethod
    def get_entry_by_id(db: Session, user_id: int, entry_id: int) -> Optional[JournalEntry]:
        return db.query(JournalEntry).filter(
            JournalEntry.id == entry_id,
            JournalEntry.user_id == user_id
        ).first()

    @staticmethod
    def update_entry(
        db: Session,
        user_id: int,
        entry_id: int,
        entry_update: JournalEntryUpdate
    ) -> Optional[JournalEntry]:
        entry = JournalService.get_entry_by_id(db, user_id, entry_id)
        if not entry:
            return None

        update_data = entry_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(entry, key, value)

        db.commit()
        db.refresh(entry)
        return entry

    @staticmethod
    def delete_entry(db: Session, user_id: int, entry_id: int) -> bool:
        entry = JournalService.get_entry_by_id(db, user_id, entry_id)
        if not entry:
            return False

        db.delete(entry)
        db.commit()
        return True


journal_service = JournalService()
