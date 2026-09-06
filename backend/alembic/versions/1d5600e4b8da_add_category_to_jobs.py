"""add category to jobs

Revision ID: 1d5600e4b8da
Revises: ba0bbb39bfdc
Create Date: 2026-09-05

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '1d5600e4b8da'
down_revision: Union[str, None] = 'ba0bbb39bfdc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('jobs', sa.Column('category', sa.String(), nullable=True))
    op.create_index(op.f('ix_jobs_category'), 'jobs', ['category'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_jobs_category'), table_name='jobs')
    op.drop_column('jobs', 'category')
