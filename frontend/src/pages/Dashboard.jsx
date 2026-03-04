import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { schoolsAPI, classroomsAPI, studentsAPI } from '../services/api';

const Dashboard = () => {
  const { user, isSuperadmin } = useAuth();
  const [stats, setStats] = useState({
    schools: 0,
    classrooms: 0,
    students: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (isSuperadmin()) {
          const schoolsRes = await schoolsAPI.getAll(1, 1);
          setStats(prev => ({ ...prev, schools: schoolsRes.data.data.pagination?.total || 0 }));
        }
        
        const classroomsRes = await classroomsAPI.getAll(1, 1);
        const studentsRes = await studentsAPI.getAll(1, 1);
        
        setStats(prev => ({
          ...prev,
          classrooms: classroomsRes.data.data.pagination?.total || 0,
          students: studentsRes.data.data.pagination?.total || 0,
        }));
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isSuperadmin]);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.name}!
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {isSuperadmin() && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">🏫</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Schools
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {stats.schools}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">📚</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Classrooms
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {stats.classrooms}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">👥</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Students
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {stats.students}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
