import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  X,
  Award,
  Sparkles,
} from 'lucide-react';
import { fetchPublishedFormsPaginated } from '../store/slices/formSlice';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ProgramsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { publishedForms, isLoading } = useSelector((state) => state.form);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    dispatch(fetchPublishedFormsPaginated({ page: 0, size: 100 }));
  }, [dispatch]);

  // Filter programs based on search
  useEffect(() => {
    if (!publishedForms || !Array.isArray(publishedForms)) {
      setFilteredPrograms([]);
      return;
    }

    // Filter out forms with formCode (page-based forms like PARTNERSHIP)
    // Only show forms with eventCode or forms without formCode
    const programForms = publishedForms.filter(
      (form) => !form.formCode || form.formCode === null || form.formCode === ''
    );

    if (searchQuery.trim()) {
      const filtered = programForms.filter(
        (form) =>
          form.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          form.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPrograms(filtered);
    } else {
      setFilteredPrograms(programForms);
    }
  }, [publishedForms, searchQuery]);

  const handleProgramClick = (program) => {
    navigate(`/programs/${program.id}`);
  };

  const getProgramIcon = (index) => {
    const icons = [Award, Sparkles, Award, Sparkles];
    return icons[index % icons.length];
  };

  const getProgramColor = (index) => {
    const colors = [
      { bg: 'bg-gradient-to-br from-primary-500 to-primary-600', text: 'text-primary-500' },
      { bg: 'bg-gradient-to-br from-yellow-400 to-yellow-500', text: 'text-yellow-600' },
      { bg: 'bg-gradient-to-br from-primary-600 to-black', text: 'text-primary-600' },
      { bg: 'bg-gradient-to-br from-yellow-500 to-primary-500', text: 'text-primary-500' },
    ];
    return colors[index % colors.length];
  };

  if (isLoading && !filteredPrograms.length) {
    return <LoadingSpinner fullScreen text="Loading programs..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-500 via-primary-600 to-black py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              Discover Our <span className="text-yellow-400">Programs</span>
            </h1>
            <p className="text-xl sm:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Join thousands of believers in transformative learning experiences
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search programs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 shadow-xl text-lg focus:outline-none focus:ring-4 focus:ring-primary-300 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {filteredPrograms.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="text-gray-400" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No programs found</h3>
            <p className="text-gray-500">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'No programs are currently available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPrograms.map((program, index) => {
              const Icon = getProgramIcon(index);
              const colorScheme = getProgramColor(index);
              const isHovered = hoveredCard === program.id;

              return (
                <div
                  key={program.id}
                  onMouseEnter={() => setHoveredCard(program.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => handleProgramClick(program)}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                >
                  {/* Card Header with Gradient */}
                  <div className={`${colorScheme.bg} p-6 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <div className="relative">
                      <div className="w-14 h-14 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Icon className="text-white" size={28} />
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {program.title}
                    </h3>
                    <p className="text-gray-600 mb-6 line-clamp-2">
                      {program.description || 'Join this program to learn and grow with us.'}
                    </p>

                    {/* CTA Button */}
                    <button
                      className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
                        isHovered
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700'
                      } flex items-center justify-center gap-2`}
                    >
                      Apply Now
                      <ArrowRight
                        size={18}
                        className={`transition-transform ${isHovered ? 'translate-x-1' : ''}`}
                      />
                    </button>
                  </div>

                  {/* Decorative Element */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white to-transparent opacity-0 group-hover:opacity-10 rounded-full -mr-16 -mt-16 transition-opacity"></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join our community of believers and grow in your walk with God.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-yellow-400 text-black px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
          >
            Browse Programs
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgramsPage;
