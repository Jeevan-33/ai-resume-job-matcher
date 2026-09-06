"""add candidate_name and summary to resumes

Revision ID: ba0bbb39bfdc
Revises: 4fad824b033c
Create Date: 2026-09-05

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'ba0bbb39bfdc'
down_revision: Union[str, None] = '4fad824b033c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('resumes', sa.Column('candidate_name', sa.String(), nullable=True))
    op.add_column('resumes', sa.Column('summary', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('resumes', 'summary')
    op.drop_column('resumes', 'candidate_name')
