#!/usr/bin/env python3
"""
Script to run the database seeding
"""
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from seed_data import main

if __name__ == "__main__":
    main()
